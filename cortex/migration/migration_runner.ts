// cortex/migration/migration_runner.ts
import Builder from "./Builder";
import {getDbConfig} from "../database/getDbConfig";
import {getConnection} from "../database/connection_manager";
import {discoverMigrationFiles, dynamicImportFile} from "./discover";
import type {TableBlueprint} from "./Blueprint";
import {
    ensureMigrationsTable,
    readAppliedAll,
    readAppliedModelSet,
    recordApplied,
    removeApplied,
    currentBatch,
    type ConnectionLike,
    type DBDriver,
} from "./tracking";

export type Profile = string;
type TableModule = { default: { tableName: string; def: (t: TableBlueprint) => void } };
type SchemaObjectModule = { default: { name: string; columns: unknown[]; constraints?: unknown[] } };

export interface RunOutput {
    results: Array<{ name: string; content: string; file: string }>;
}

/** Exec SQL in a driver-agnostic way (adds exec/prepare for better-sqlite3). */
async function execSQL(conn: ConnectionLike, sql: string): Promise<void> {
    const anyConn = conn as any;
    if (typeof anyConn.query === "function") {
        await anyConn.query(sql);
        return;
    }
    if (typeof anyConn.execute === "function") {
        await anyConn.execute(sql);
        return;
    }
    if (typeof anyConn.run === "function") {
        await anyConn.run(sql);
        return;
    }

    if (typeof anyConn.exec === "function") {
        anyConn.exec(sql);
        return;
    }
    if (typeof anyConn.prepare === "function") {
        const stmt: any = anyConn.prepare(sql);
        if (stmt?.run) {
            stmt.run();
            return;
        }
        if (stmt?.all) {
            stmt.all();
            return;
        }
        if (stmt?.get) {
            stmt.get();
            return;
        }
    }
    throw new Error("Runner: connection has no query/execute/run/exec/prepare method to execute SQL.");
}

function logBlock(name: string, content: string, print: boolean) {
    if (!print) return;
    console.log(name);
    console.log("content");
    console.log(content);
    console.log();
}

async function buildModelIndex(files: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    for (const f of files) {
        try {
            const mod: any = await dynamicImportFile(f);
            // Accept both shapes:
            // 1) { default: { tableName, def } }
            // 2) { default: { name, columns[, constraints] } }
            const bpName = mod?.default?.tableName;
            const soName = mod?.default?.name;
            const chosen = typeof bpName === "string" && bpName.trim()
                ? bpName
                : (typeof soName === "string" && soName.trim() ? soName : undefined);
            if (chosen) {
                map.set(chosen, f);
            } else {
                // Visible diagnostic: migration file did not match either shape.
                // (Non-fatal: we just skip it.)
                // console.warn(`[runner] skipped migration (unrecognized export): ${f}`);
            }
        } catch {
            // console.warn(`[runner] failed to import migration: ${f}`);
        }
    }
    return map;
}

async function withSilencedDialectWarning<T>(fn: () => Promise<T>, enabled: boolean): Promise<T> {
    if (!enabled) return fn();
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
        const msg = args?.[0];
        if (typeof msg === "string" && msg.includes("SQL dialect is not configured")) return;
        return (originalWarn as any).apply(console, args as any);
    };
    try {
        return await fn();
    } finally {
        console.warn = originalWarn;
    }
}

/** The shared migration engine (OLD connection style: profile -> getConnection(profile)). */
export async function runMigrations(opts: {
    profile?: Profile;
    print?: boolean;
    action?: "up" | "down" | "drop" | "rollback" | "fresh" | "refresh";
    steps?: number;
    toBatch?: number;
    conn?: ConnectionLike;
    silenceDialectWarn?: boolean;
} = {}): Promise<RunOutput> {
    const profile = opts.profile ?? "default";
    const print = opts.print ?? true;
    const action = opts.action ?? "up";
    const steps = opts.steps && opts.steps > 0 ? Math.floor(opts.steps) : undefined;
    const toBatch = typeof opts.toBatch === "number" ? opts.toBatch : undefined;
    const silenceDialectWarn = opts.silenceDialectWarn ?? true;

    return withSilencedDialectWarning(async () => {
        if (print) console.log("[runner] starting migration run...");

        // 1) Driver & builder (sync getDbConfig with profile)
        const cfg = getDbConfig(profile);
        if (!cfg?.driver) throw new Error(`Runner: getDbConfig(${profile}) returned no driver.`);
        const driver = cfg.driver as DBDriver;
        const builder = new Builder(driver);

        // For visibility/debugging differences between CLI and tests:
        if (print) {
            const dbg = {profile, driver: cfg.driver, host: (cfg as any).host, file: (cfg as any).file};
            console.log("[runner] resolved config:", dbg);
        }

        // 2) Discover files and build model index
        const files = discoverMigrationFiles();
        const modelIndex = await buildModelIndex(files); // model -> file
        if (print && modelIndex.size === 0) {
            console.log("[runner] no eligible migration modules found (expected either {tableName, def} or {name, columns}).");
        }

        // 3) Connection (OLD: profile -> getConnection(profile))
        const externalConn = opts.conn;
        const conn = (externalConn ?? (await getConnection(profile))) as unknown as ConnectionLike;
        const shouldClose = !externalConn;

        // 4) Tracking
        await ensureMigrationsTable(conn, driver);
        const appliedRows = await readAppliedAll(conn);
        const appliedModelSet = await readAppliedModelSet(conn);

        const results: RunOutput["results"] = [];

        // const applyOne = async (file: string, model: string, batch: number) => {
        //     const mod = (await dynamicImportFile(file)) as TableModule;
        //     const defObj = mod?.default;
        //     if (!defObj?.tableName || typeof defObj?.def !== "function") return;
        //     if (appliedModelSet.has(model)) return;
        //
        //     const {name, content} = builder.buildCreateTable(model, defObj.def);
        //     logBlock(name, content, print);
        //
        //     await execSQL(conn, content);
        //     // old signature: (conn, file, content, batch, model)
        //     await recordApplied(conn, file, content, batch, model);
        //
        //     results.push({name, content, file});
        //     appliedModelSet.add(model);
        // };

        const applyOne = async (file: string, model: string, batch: number) => {
            const modAny: any = await dynamicImportFile(file);
            const d = modAny?.default;
            if (appliedModelSet.has(model)) return;

            let name: string | undefined;
            let content: string | undefined;

            // Shape 1: blueprint-style { tableName, def }
            if (d && typeof d.tableName === "string" && typeof d.def === "function") {
                ({name, content} = builder.buildCreateTable(model, d.def));
            }
            // Shape 2: schema-object { name, columns[, constraints] }
            else if (d && typeof d.name === "string" && Array.isArray(d.columns)) {
                ({name, content} = builder.buildCreateFromSchemaObject({
                    name: d.name,
                    columns: d.columns,
                    constraints: Array.isArray(d.constraints) ? d.constraints : [],
                } as any));
            } else {
                // Unrecognized module shape: skip quietly (keeps older behavior),
                // but we still want to make it debuggable if needed.
                // if (print) console.warn(`[runner] skipping (unrecognized export): ${file}`);
                return;
            }

            if (!name || !content) return;
            logBlock(name, content, print);

            await execSQL(conn, content);
            await recordApplied(conn, file, content, batch, model);

            results.push({name, content, file});
            appliedModelSet.add(model);
        };


        const dropOneByModel = async (model: string) => {
            const file = modelIndex.get(model); // helps produce a nice “file” in results

            const {name, content} = builder.buildDropTable(model);
            logBlock(name, content, print);

            await execSQL(conn, content);
            await removeApplied(conn, model);

            results.push({name, content, file: file ?? model});
            appliedModelSet.delete(model);
        };

        // ---- Actions (OLD semantics) ----
        if (action === "up") {
            const next = (await currentBatch(conn)) + 1;
            for (const [model, f] of modelIndex) await applyOne(f, model, next);

        } else if (action === "down" || action === "drop") {
            for (const r of [...appliedRows].reverse()) await dropOneByModel((r as any).model);

        } else if (action === "rollback") {
            let targets: string[];

            if (typeof toBatch === "number") {
                targets = appliedRows
                    .filter((r: any) => r.batch > toBatch)
                    .map((r: any) => r.model)
                    .reverse();
            } else {
                const n = steps ?? 1;
                const batchesDesc = Array.from(new Set(appliedRows.map((r: any) => r.batch))).sort((a, b) => b - a);
                const selected = new Set(batchesDesc.slice(0, n));
                targets = appliedRows
                    .filter((r: any) => selected.has(r.batch))
                    .map((r: any) => r.model)
                    .reverse();
            }

            for (const model of targets) await dropOneByModel(model);

        } else if (action === "fresh") {
            for (const r of [...appliedRows].reverse()) await dropOneByModel((r as any).model);
            const next = (await currentBatch(conn)) + 1;
            for (const [model, f] of modelIndex) await applyOne(f, model, next);

        } else if (action === "refresh") {
            const n = steps ?? 1;
            const batchesDesc = Array.from(new Set(appliedRows.map((r: any) => r.batch))).sort((a, b) => b - a);
            const selected = new Set(batchesDesc.slice(0, n));
            const toDrop = appliedRows.filter((r: any) => selected.has(r.batch)).map((r: any) => r.model).reverse();

            for (const model of toDrop) await dropOneByModel(model);

            const next = (await currentBatch(conn)) + 1;
            for (const [model, f] of modelIndex) {
                if (!appliedModelSet.has(model)) await applyOne(f, model, next);
            }
        }

        if (shouldClose) {
            const anyConn = conn as any;
            if (typeof anyConn.close === "function") await anyConn.close();
            else if (typeof anyConn.end === "function") await anyConn.end();
        }

        if (print) console.log("[runner] migration run finished. ✅");
        return {results};
    }, silenceDialectWarn);
}
