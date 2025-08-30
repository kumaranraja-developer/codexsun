// cortex/migration/Runner.ts
import Builder from "./Builder";
import { getDbConfig } from "../database/getDbConfig";
import { getConnection } from "../database/connection_manager";
import { discoverMigrationFiles, dynamicImportFile } from "./discover";
import type { TableBlueprint } from "./Blueprint";
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

type Profile = string;
type TableModule = { default: { tableName: string; def: (t: TableBlueprint) => void } };

export interface RunOutput {
    results: Array<{ name: string; content: string; file: string }>;
}

/** Exec SQL in a driver-agnostic way (adds exec/prepare for better-sqlite3). */
async function execSQL(conn: ConnectionLike, sql: string): Promise<void> {
    if (typeof conn.query === "function")  { await conn.query(sql);  return; }
    if (typeof conn.execute === "function"){ await conn.execute(sql);return; }
    if (typeof conn.run === "function")    { await conn.run(sql);    return; }

    if (typeof conn.exec === "function")   { conn.exec(sql);         return; }
    if (typeof conn.prepare === "function") {
        const stmt: any = conn.prepare(sql);
        if (stmt && typeof stmt.run === "function") { stmt.run(); return; }
        if (stmt && typeof stmt.all === "function") { stmt.all(); return; }
        if (stmt && typeof stmt.get === "function") { stmt.get(); return; }
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

/** Build a model -> file map from discovered migration modules. */
async function buildModelIndex(files: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    for (const f of files) {
        try {
            const mod = (await dynamicImportFile(f)) as TableModule;
            const name = mod?.default?.tableName;
            if (typeof name === "string" && name.trim()) {
                // if duplicates exist, prefer the latest (higher numeric prefix)
                map.set(name, f);
            }
        } catch {
            // ignore bad modules
        }
    }
    return map;
}

/** Silence noisy dialect warnings during tests if requested. */
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

        // 1) Driver & builder
        const cfg = getDbConfig(profile);
        if (!cfg?.driver) throw new Error("Runner: getDbConfig() did not return a driver.");
        const builder = new Builder(cfg.driver as DBDriver);

        // 2) Discover files and build model index
        const files = discoverMigrationFiles();
        const modelIndex = await buildModelIndex(files); // model -> file

        // 3) Connection
        const externalConn = opts.conn;
        const conn = (externalConn ?? (await getConnection(profile))) as ConnectionLike;
        const shouldClose = !externalConn;

        // 4) Tracking
        await ensureMigrationsTable(conn, cfg.driver as DBDriver);
        const appliedRows = await readAppliedAll(conn);
        const appliedModelSet = await readAppliedModelSet(conn);

        const results: RunOutput["results"] = [];

        const applyOne = async (file: string, model: string, batch: number) => {
            const mod = (await dynamicImportFile(file)) as TableModule;
            const defObj = mod?.default;
            if (!defObj?.tableName || typeof defObj?.def !== "function") return;

            if (appliedModelSet.has(model)) return;

            const { name, content } = builder.buildCreateTable(model, defObj.def);
            logBlock(name, content, print);

            await execSQL(conn, content);
            await recordApplied(conn, file, content, batch, model);

            results.push({ name, content, file });
            appliedModelSet.add(model);
        };

        const dropOneByModel = async (model: string) => {
            // Try to use discovered file path (safer than DB path on platform differences)
            const file = modelIndex.get(model);

            const { name, content } = builder.buildDropTable(model);
            logBlock(name, content, print);

            await execSQL(conn, content);
            await removeApplied(conn, model);

            results.push({ name, content, file: file ?? model });
            appliedModelSet.delete(model);
        };

        // ---- Actions ----
        if (action === "up") {
            const next = (await currentBatch(conn)) + 1;
            for (const [model, f] of modelIndex) {
                await applyOne(f, model, next);
            }

        } else if (action === "down" || action === "drop") {
            for (const r of [...appliedRows].reverse()) {
                await dropOneByModel(r.model);
            }

        } else if (action === "rollback") {
            let targets: string[];

            if (typeof toBatch === "number") {
                targets = appliedRows
                    .filter(r => r.batch > toBatch)
                    .map(r => r.model)
                    .reverse();
            } else {
                const n = steps ?? 1;
                const batchesDesc = Array.from(new Set(appliedRows.map(r => r.batch))).sort((a,b)=>b-a);
                const selected = new Set(batchesDesc.slice(0, n));
                targets = appliedRows
                    .filter(r => selected.has(r.batch))
                    .map(r => r.model)
                    .reverse();
            }

            for (const model of targets) await dropOneByModel(model);

        } else if (action === "fresh") {
            for (const r of [...appliedRows].reverse()) await dropOneByModel(r.model);
            const next = (await currentBatch(conn)) + 1;
            for (const [model, f] of modelIndex) await applyOne(f, model, next);

        } else if (action === "refresh") {
            const n = steps ?? 1;
            const batchesDesc = Array.from(new Set(appliedRows.map(r => r.batch))).sort((a,b)=>b-a);
            const selected = new Set(batchesDesc.slice(0, n));
            const toDrop = appliedRows.filter(r => selected.has(r.batch)).map(r => r.model).reverse();

            for (const model of toDrop) await dropOneByModel(model);

            const next = (await currentBatch(conn)) + 1;
            for (const [model, f] of modelIndex) {
                if (!appliedModelSet.has(model)) await applyOne(f, model, next);
            }
        }

        if (shouldClose) {
            if (typeof (conn as any).close === "function") await (conn as any).close();
            else if (typeof (conn as any).end === "function") await (conn as any).end();
        }

        if (print) console.log("[runner] migration run finished. ✅");
        return { results };
    }, silenceDialectWarn);
}

/* --------------------------- default export API --------------------------- */
/* Keep the CLI happy: default object with fresh/refresh/up/down. */

async function fresh(): Promise<void> {
    await runMigrations({ action: "fresh" });
}

async function refresh(): Promise<void> {
    await runMigrations({ action: "refresh" });
}

async function up(): Promise<void> {
    await runMigrations({ action: "up" });
}

async function down(): Promise<void> {
    // old semantics: “down” equals dropping everything in last batch
    await runMigrations({ action: "down" });
}

export default { fresh, refresh, up, down };
