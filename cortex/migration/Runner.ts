// cortex/migration/Runner.ts
import Builder, { type DBDriver } from "./Builder";
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
} from "./tracking";

type Profile = string;
type TableModule = { default: { tableName: string; def: (t: TableBlueprint) => void } };

export interface RunOutput {
    results: Array<{ name: string; content: string; file: string }>;
}

async function execSQL(conn: ConnectionLike, sql: string): Promise<void> {
    if (typeof conn.query === "function") { await conn.query(sql); return; }
    if (typeof conn.execute === "function") { await conn.execute(sql); return; }
    if (typeof conn.run === "function") { await conn.run(sql); return; }
    throw new Error("Runner: connection has no query/execute/run method to execute SQL.");
}

function logBlock(name: string, content: string, print: boolean) {
    if (!print) return;
    console.log(name);       // model / table name
    console.log("content");
    console.log(content);
    console.log();
}

/** Suppresses the specific warning message: "SQL dialect is not configured." */
function withSilencedDialectWarning<T>(fn: () => Promise<T>, enabled: boolean): Promise<T> {
    if (!enabled) return fn();
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
        const msg = args?.[0];
        if (typeof msg === "string" && msg.includes("SQL dialect is not configured")) {
            return; // swallow just this warning
        }
        // passthrough others
        return originalWarn.apply(console, args);
    };
    return fn().finally(() => {
        console.warn = originalWarn;
    });
}

export async function runMigrations(opts: {
    profile?: Profile;
    print?: boolean;
    action?: "up" | "down" | "drop" | "rollback" | "fresh" | "refresh";
    steps?: number;     // rollback/refresh N batches (default 1)
    toBatch?: number;   // rollback down to (and keep) this batch: drop all with batch > toBatch
    conn?: ConnectionLike; // reuse external connection (tests/embedding in apps)
    silenceDialectWarn?: boolean; // default true
} = {}): Promise<RunOutput> {
    const profile = opts.profile ?? "default";
    const print = opts.print ?? true;
    const action = opts.action ?? "up";
    const steps = opts.steps && opts.steps > 0 ? Math.floor(opts.steps) : undefined;
    const toBatch = typeof opts.toBatch === "number" ? opts.toBatch : undefined;
    const silenceDialectWarn = opts.silenceDialectWarn ?? true;

    return withSilencedDialectWarning(async () => {
        if (print) console.log("[test] starting migration run...");

        // 1) Resolve driver from config (single source of truth)
        const cfg = getDbConfig(profile);
        if (!cfg?.driver) throw new Error("Runner: getDbConfig() did not return a driver.");
        const builder = new Builder(cfg.driver as DBDriver);

        // 2) Discover migration files
        const files = discoverMigrationFiles();

        // 3) Acquire connection (use provided one if any)
        const externalConn = opts.conn;
        const conn = (externalConn ?? (await getConnection(profile))) as ConnectionLike;
        const shouldClose = !externalConn;

        // 4) Ensure tracking table exists
        await ensureMigrationsTable(conn);

        // 5) Load applied state
        const appliedRows = await readAppliedAll(conn);             // [{ model, filename, batch, ... }]
        const appliedModelSet = await readAppliedModelSet(conn);    // Set<string> of models

        const results: RunOutput["results"] = [];
        const loadModule = async (full: string) => (await dynamicImportFile(full)) as TableModule;

        const applyOne = async (file: string, batch: number) => {
            const mod = await loadModule(file);
            const defObj = mod?.default;
            if (!defObj?.tableName || typeof defObj?.def !== "function") return;

            const model = defObj.tableName;
            if (appliedModelSet.has(model)) return; // already applied

            const { name, content } = builder.buildCreateTable(model, defObj.def);
            logBlock(name, content, print);

            await execSQL(conn, content);
            await recordApplied(conn, file, content, batch, model);

            results.push({ name, content, file });
            appliedModelSet.add(model); // keep in-memory view fresh
        };

        const dropOne = async (file: string, model: string) => {
            const mod = await loadModule(file);
            const defObj = mod?.default;
            if (!defObj?.tableName || typeof defObj?.def !== "function") return;

            const { name, content } = builder.buildDropTable(model);
            logBlock(name, content, print);

            await execSQL(conn, content);
            await removeApplied(conn, model);

            results.push({ name, content, file });
            appliedModelSet.delete(model);
        };

        // ---- Actions ----
        if (action === "up") {
            const next = (await currentBatch(conn)) + 1;
            for (const f of files) await applyOne(f, next);

        } else if (action === "down" || action === "drop") {
            // Drop ALL applied, in reverse applied order
            for (const r of [...appliedRows].reverse()) {
                await dropOne(r.filename, r.model);
            }

        } else if (action === "rollback") {
            let targets: Array<{ filename: string; model: string }> = [];

            if (typeof toBatch === "number") {
                // Drop all files with batch > toBatch (reverse applied order)
                targets = appliedRows
                    .filter(r => r.batch > toBatch)
                    .map(r => ({ filename: r.filename, model: r.model }))
                    .reverse();
            } else {
                // Roll back last N batches (default 1)
                const n = steps ?? 1;
                const batchesDesc = Array.from(new Set(appliedRows.map(r => r.batch))).sort((a,b)=>b-a);
                const selected = new Set(batchesDesc.slice(0, n));
                targets = appliedRows
                    .filter(r => selected.has(r.batch))
                    .map(r => ({ filename: r.filename, model: r.model }))
                    .reverse();
            }

            for (const t of targets) await dropOne(t.filename, t.model);

        } else if (action === "fresh") {
            // Drop everything, then up everything into a new batch
            for (const r of [...appliedRows].reverse()) await dropOne(r.filename, r.model);
            const next = (await currentBatch(conn)) + 1;
            for (const f of files) await applyOne(f, next);

        } else if (action === "refresh") {
            // Rollback N batches (default 1), then apply pending into a new batch
            const n = steps ?? 1;
            const batchesDesc = Array.from(new Set(appliedRows.map(r => r.batch))).sort((a,b)=>b-a);
            const selected = new Set(batchesDesc.slice(0, n));
            const toDrop = appliedRows
                .filter(r => selected.has(r.batch))
                .map(r => ({ filename: r.filename, model: r.model }))
                .reverse();

            for (const t of toDrop) await dropOne(t.filename, t.model);

            // recompute next batch and applied set
            const next = (await currentBatch(conn)) + 1;
            const currentModels = await readAppliedModelSet(conn);
            for (const f of files) {
                const mod = await loadModule(f);
                const defObj = mod?.default;
                if (!defObj?.tableName || typeof defObj?.def !== "function") continue;
                if (currentModels.has(defObj.tableName)) continue;
                await applyOne(f, next);
            }
        }

        // 6) Close connection if we opened it
        if (shouldClose) {
            if (typeof (conn as any).close === "function") await (conn as any).close();
            else if (typeof (conn as any).end === "function") await (conn as any).end();
        }

        if (print) console.log("[test] migration run finished. ✅");
        return { results };
    }, silenceDialectWarn);
}
