import * as fs from "node:fs";
import * as path from "node:path";
import type { Engine } from "../../database/connection";

export function appMigrationDir(appName: string) {
    const base = path.join(process.cwd(), "apps", appName, "database");
    const plural = path.join(base, "migrations");
    const singular = path.join(base, "migration");
    if (fs.existsSync(plural)) return plural;
    if (fs.existsSync(singular)) return singular;
    return plural;
}

export function migrationPath(appName: string, fileName: string) {
    return path.join(appMigrationDir(appName), fileName);
}

export function listMigrationFiles(appName: string): string[] {
    const dir = appMigrationDir(appName);
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter(f => f.toLowerCase().endsWith(".sql") && !f.toLowerCase().endsWith("_down.sql"))
        .sort();
}

export function readSQL(appName: string, fileName: string) {
    return fs.readFileSync(migrationPath(appName, fileName), "utf8");
}

export function splitSQL(script: string): string[] {
    const out: string[] = [];
    let acc: string[] = [];
    for (const line of script.split(/\r?\n/)) {
        acc.push(line);
        if (line.trim().endsWith(";")) {
            const stmt = acc.join("\n").trim();
            if (stmt) out.push(stmt);
            acc = [];
        }
    }
    const tail = acc.join("\n").trim();
    if (tail) out.push(tail);
    return out;
}

export async function ensureMigrationsTable(engine: Engine) {
    await engine.execute(`
        CREATE TABLE IF NOT EXISTS _migrations (
                                                   app TEXT NOT NULL,
                                                   name TEXT NOT NULL,
                                                   applied_at TIMESTAMP NOT NULL,
                                                   PRIMARY KEY (app, name)
            )
    `);
}

export async function appliedForApp(engine: Engine, app: string): Promise<string[]> {
    await ensureMigrationsTable(engine);
    const { rows } = await engine.query(
        "SELECT name FROM _migrations WHERE app = ? ORDER BY name ASC",
        [app]
    );
    return (rows as any[]).map(r => r.name ?? r["name"]);
}

export async function markApplied(engine: Engine, app: string, name: string) {
    await ensureMigrationsTable(engine);
    await engine.execute(
        "INSERT INTO _migrations (app, name, applied_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        [app, name]
    );
}

export async function unmarkApplied(engine: Engine, app: string, name: string) {
    await ensureMigrationsTable(engine);
    await engine.execute("DELETE FROM _migrations WHERE app = ? AND name = ?", [app, name]);
}

export async function lastApplied(engine: Engine, app: string, steps = 1): Promise<string[]> {
    await ensureMigrationsTable(engine);
    const { rows } = await engine.query(
        "SELECT name FROM _migrations WHERE app = ? ORDER BY applied_at DESC, name DESC LIMIT ?",
        [app, steps]
    );
    return (rows as any[]).map(r => r.name ?? r["name"]);
}

export async function applySQL(engine: Engine, sql: string, dryRun = false, verbose = false) {
    for (const stmt of splitSQL(sql)) {
        if (verbose) console.log("   SQL>", stmt.replace(/\s+/g, " ").slice(0, 240));
        if (!dryRun) await engine.execute(stmt);
    }
}

export async function dropAllTables(engine: Engine, verbose = false, dryRun = false) {
    try {
        const { rows } = await engine.query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name <> '_migrations'"
        );
        const names = (rows as any[]).map(r => r.name ?? r["name"]);
        if (names.length && verbose) console.log("   Tables(sqlite):", names.join(", "));
        for (const t of names) {
            const q = `DROP TABLE IF EXISTS "${t}"`;
            if (verbose) console.log("   Drop(sqlite)>", q);
            if (!dryRun) await engine.execute(q);
        }
        return;
    } catch {}

    try {
        const { rows } = await engine.query(
            "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type='BASE TABLE' AND table_name <> '_migrations'"
        );
        const names = (rows as any[]).map(r => r.name ?? r["name"]);
        if (names.length && verbose) console.log("   Tables(mysql):", names.join(", "));
        if (names.length && !dryRun) await engine.execute("SET FOREIGN_KEY_CHECKS=0");
        for (const t of names) {
            const q = "DROP TABLE IF EXISTS `" + t + "`";
            if (verbose) console.log("   Drop(mysql)>", q);
            if (!dryRun) await engine.execute(q);
        }
        if (names.length && !dryRun) await engine.execute("SET FOREIGN_KEY_CHECKS=1");
        return;
    } catch {}

    try {
        const { rows } = await engine.query(
            "SELECT tablename AS name FROM pg_tables WHERE schemaname='public' AND tablename <> '_migrations'"
        );
        const names = (rows as any[]).map(r => r.name ?? r["name"]);
        if (names.length && verbose) console.log("   Tables(pg):", names.join(", "));
        for (const t of names) {
            const q = `DROP TABLE IF EXISTS "${t}" CASCADE`;
            if (verbose) console.log("   Drop(pg)>", q);
            if (!dryRun) await engine.execute(q);
        }
        return;
    } catch {}
}

export function discoverAllApps(): string[] {
    const base = path.join(process.cwd(), "apps");
    if (!fs.existsSync(base)) return [];
    const out: string[] = [];
    for (const dir of fs.readdirSync(base, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        const dbDir = path.join(base, dir.name, "database");
        const mig = appMigrationDir(dir.name);
        if (fs.existsSync(dbDir) && fs.existsSync(mig)) out.push(dir.name);
    }
    return out.sort();
}

export async function printDbInfo(engine: Engine, prefix = "") {
    try {
        const { rows } = await engine.query("PRAGMA database_list");
        const main = (rows as any[]).find(r => (r.name ?? r["name"]) === "main");
        const file = main?.file ?? main?.["file"];
        if (file) console.log(`${prefix}DB file: ${file}`);
    } catch {}
}
