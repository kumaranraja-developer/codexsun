// cortex/migration/Runner.ts

import Builder, { type DBDriver } from "./Builder";
import { getDbConfig } from "../database/getDbConfig";
import { getConnection } from "../database/connection_manager";
import { discoverMigrationFiles, dynamicImportFile } from "./discover";
import {color} from "../utils/logger";

type Profile = string;
type TableModule = { default: { tableName: string; def: (t: any) => void } };
type ConnectionLike = {
    query?: (sql: string) => Promise<any>;
    execute?: (sql: string) => Promise<any>;
    run?: (sql: string) => Promise<any>;
    close?: () => Promise<any> | any;
    end?: () => Promise<any> | any;
};

export interface RunOutput {
    results: Array<{ name: string; content: string; file: string }>;
}

async function execSQL(conn: ConnectionLike, sql: string): Promise<void> {
    if (typeof conn.query === "function") { await conn.query(sql); return; }
    if (typeof conn.execute === "function") { await conn.execute(sql); return; }
    if (typeof conn.run === "function") { await conn.run(sql); return; }
    throw new Error("Runner: connection has no query/execute/run method to execute SQL.");
}

export async function runMigrations(opts: { profile?: Profile; print?: boolean } = {}): Promise<RunOutput> {
    const profile = opts.profile ?? "default";
    const print = opts.print ?? true;

    // header (single, clean)
    if (print) console.log("[test] starting migration run...");

    // 1) Resolve driver from config (single source of truth)
    const cfg = getDbConfig(profile);
    if (!cfg?.driver) {
        throw new Error("Runner: getDbConfig() did not return a driver.");
    }
    const driver = cfg.driver as DBDriver;

    // 2) Build SQL generator for this driver
    const builder = new Builder(driver);

    // 3) Discover migrations
    const files = discoverMigrationFiles();
    if (files.length === 0) {
        if (print) console.log("[test] no migrations found.");
        if (print) console.log("[test] migration run finished. ✅");
        return { results: [] };
    }

    // 4) Acquire live connection
    const conn = (await getConnection(profile)) as ConnectionLike;

    // 5) Generate + execute
    const results: RunOutput["results"] = [];
    for (const full of files) {
        const mod = (await dynamicImportFile(full)) as TableModule;
        const defObj = mod?.default;
        if (!defObj?.tableName || typeof defObj?.def !== "function") continue;

        const { name, content } = builder.buildCreateTable(defObj.tableName, defObj.def);

        if (print) {
            console.log(name);
            console.log("content");
            console.log(content);
            console.log(); // blank line between items
        }

        await execSQL(conn, content);
        results.push({ name, content, file: full });
    }

    // 6) Close connection
    if (typeof conn.close === "function") await conn.close();
    else if (typeof conn.end === "function") await conn.end();

    if (print) console.log('\n' + color.green('[test] migration run finished. ✅'));
    return { results };
}
