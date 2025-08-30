// cortex/migration/Runner.ts
import Builder, { type DBDriver } from "./Builder";
import { getDbConfig } from "../database/getDbConfig";
import { getConnection } from "../database/connection_manager";
import { discoverMigrationFiles, dynamicImportFile } from "./discover";
import type { TableBlueprint } from "./Blueprint";

import {
    ensureMigrationsTable,
    readAppliedAll,
    readAppliedSet,
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
    console.log(name);
    console.log("content");
    console.log(content);
    console.log();
}

export async function runMigrations(opts: {
    profile?: Profile;
    print?: boolean;
    action?: "up" | "down" | "drop" | "rollback" | "fresh" | "refresh";
    steps?: number;          // rollback N batches; refresh N batches (default 1)
    toBatch?: number;        // rollback down to (and keep) this batch (drop > toBatch)
} = {}): Promise<RunOutput> {
    const profile = opts.profile ?? "default";
    const print = opts.print ?? true;
    const action = opts.action ?? "up";
    const steps = opts.steps && opts.steps > 0 ? Math.floor(opts.steps) : undefined;
    const toBatch = typeof opts.toBatch === "number" ? opts.toBatch : undefined;

    if (print) console.log("[test] starting migration run...");

    // 1) Driver & Builder
    const cfg = getDbConfig(profile);
    if (!cfg?.driver) throw new Error("Runner: getDbConfig() did not return a driver.");
    const builder = new Builder(cfg.driver as DBDriver);

    // 2) Discover & connect
    const files = discoverMigrationFiles();
    const conn = (await getConnection(profile)) as ConnectionLike;
    await ensureMigrationsTable(conn);

    // 3) Applied rows/state
    const appliedRows = await readAppliedAll(conn);
    const appliedSet = new Set(appliedRows.map(r => r.filename));

    const results: RunOutput["results"] = [];
    const loadModule = async (full: string) => (await dynamicImportFile(full)) as TableModule;

    const applyOne = async (file: string, batch: number) => {
        const mod = await loadModule(file);
        const defObj = mod?.default;
        if (!defObj?.tableName || typeof defObj?.def !== "function") return;
        const { name, content } = builder.buildCreateTable(defObj.tableName, defObj.def);
        logBlock(name, content, print);
        await execSQL(conn, content);
        await recordApplied(conn, file, content, batch);
        results.push({ name, content, file });
    };

    const dropOne = async (file: string) => {
        const mod = await loadModule(file);
        const defObj = mod?.default;
        if (!defObj?.tableName || typeof defObj?.def !== "function") return;
        const { name, content } = builder.buildDropTable(defObj.tableName);
        logBlock(name, content, print);
        await execSQL(conn, content);
        await removeApplied(conn, file);
        results.push({ name, content, file });
    };

    // ---- Actions ----
    if (action === "up") {
        const next = (await currentBatch(conn)) + 1;
        for (const f of files) if (!appliedSet.has(f)) await applyOne(f, next);

    } else if (action === "down" || action === "drop") {
        // Drop ALL applied, reverse applied order
        for (const f of [...appliedRows.map(r => r.filename)].reverse()) await dropOne(f);

    } else if (action === "rollback") {
        // Roll back by batches
        let targetFiles: string[] = [];
        if (typeof toBatch === "number") {
            // Drop all files with batch > toBatch, preserving reverse applied order
            const toDrop = appliedRows.filter(r => r.batch > toBatch).map(r => r.filename).reverse();
            targetFiles = toDrop;
        } else {
            // steps → last N batches (default 1)
            const n = steps ?? 1;
            const batchesDesc = Array.from(new Set(appliedRows.map(r => r.batch))).sort((a,b)=>b-a);
            const selected = new Set(batchesDesc.slice(0, n));
            targetFiles = appliedRows.filter(r => selected.has(r.batch)).map(r => r.filename).reverse();
        }
        for (const f of targetFiles) await dropOne(f);

    } else if (action === "fresh") {
        // Drop everything, then up everything into a single new batch
        for (const f of [...appliedRows.map(r => r.filename)].reverse()) await dropOne(f);
        const next = (await currentBatch(conn)) + 1;
        for (const f of files) await applyOne(f, next);

    } else if (action === "refresh") {
        // Rollback N batches (default 1), then apply pending in a new batch
        const n = steps ?? 1;
        const batchesDesc = Array.from(new Set(appliedRows.map(r => r.batch))).sort((a,b)=>b-a);
        const selected = new Set(batchesDesc.slice(0, n));
        const toDrop = appliedRows.filter(r => selected.has(r.batch)).map(r => r.filename).reverse();
        for (const f of toDrop) await dropOne(f);

        const next = (await currentBatch(conn)) + 1;
        const remaining = await readAppliedSet(conn);
        for (const f of files) if (!remaining.has(f)) await applyOne(f, next);
    }

    // Close
    if (typeof (conn as any).close === "function") await (conn as any).close();
    else if (typeof (conn as any).end === "function") await (conn as any).end();

    if (print) console.log("[test] migration run finished. ✅");
    return { results };
}
