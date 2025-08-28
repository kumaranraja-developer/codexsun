/**
 * Shared migration utilities for codexsun (Engine-based).
 * Uses Engine.query() and Engine.execute() only.
 */

import fs from "node:fs";
import path from "node:path";
import type { Engine } from "../database/Engine";

/** Discover `apps/<app>/database/migrations` OR `apps/<app>/database/migration`. */
export function appMigrationDir(appName: string) {
    const base = path.join(process.cwd(), "apps", appName, "database");
    const plural = path.join(base, "migrations");
    const singular = path.join(base, "migration");
    if (fs.existsSync(plural)) return plural;
    if (fs.existsSync(singular)) return singular;
    return plural; // default
}

/** Absolute path for a migration file. */
export function migrationPath(appName: string, fileName: string) {
    return path.join(appMigrationDir(appName), fileName);
}

/** Sorted .sql files from the app’s migrations dir. */
export function listMigrationFiles(appName: string): string[] {
    const dir = appMigrationDir(appName);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
}

/** Discover all app folders under ./apps. */
export function discoverAllApps(): string[] {
    const appsRoot = path.join(process.cwd(), "apps");
    if (!fs.existsSync(appsRoot)) return [];
    return fs
        .readdirSync(appsRoot, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
}

/** Very simple multi-statement splitter (no semicolons inside strings). */
export function splitSQL(sql: string): string[] {
    return sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s + ";");
}

/**
 * Execute SQL using Engine.
 * - Prefer Engine.execute() for DDL/DML.
 * - Fallback to Engine.query() if execute is absent.
 * - For multi-statement SQL, run statements one-by-one.
 * - Wrap in a transaction for atomicity.
 */
export async function applySQL(engine: Engine, sql: string, verbose = false) {
    const execStmt = async (stmt: string) => {
        try {
            if (engine.execute) return await engine.execute(stmt);
            return await engine.query(stmt); // some engines accept DDL via query
        } catch (err) {
            if (verbose) console.error("❌ SQL failed:\n", stmt, "\n", err);
            throw err;
        }
    };

    const stmts = splitSQL(sql);
    // attempt a txn if execute exists
    const canTxn = !!engine.execute;

    if (canTxn) {
        await execStmt("BEGIN;");
    }
    try {
        for (const stmt of stmts) {
            if (!stmt.trim()) continue;
            await execStmt(stmt);
        }
        if (canTxn) await execStmt("COMMIT;");
    } catch (e) {
        if (canTxn) {
            try { await execStmt("ROLLBACK;"); } catch { /* ignore */ }
        }
        throw e;
    }
}

/** Ensure the migrations ledger exists. */
export async function ensureMigrationsTable(engine: Engine) {
    // noinspection SqlNoDataSourceInspection
    const createSQL = `
        CREATE TABLE IF NOT EXISTS migrations (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  app TEXT NOT NULL,
                                                  filename TEXT NOT NULL,
                                                  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  UNIQUE (app, filename)
            );
    `;
    await applySQL(engine, createSQL);
}

/** Is a migration already applied? */
export async function hasApplied(engine: Engine, app: string, file: string): Promise<boolean> {
    // noinspection SqlNoDataSourceInspection
    const { rows } = await engine.query(
        `SELECT 1 AS ok FROM migrations WHERE app = ? AND filename = ?`,
        [app, file]
    );
    return Array.isArray(rows) && rows.length > 0;
}

/** Mark a migration as applied. */
export async function markApplied(engine: Engine, app: string, file: string) {
    // noinspection SqlNoDataSourceInspection
    if (engine.execute) {
        await engine.execute(`INSERT INTO migrations (app, filename) VALUES (?, ?)`, [app, file]);
    } else {
        await engine.query(`INSERT INTO migrations (app, filename) VALUES (?, ?)`, [app, file]);
    }
}

/** Last N applied filenames for an app (DESC by id). */
export async function lastApplied(engine: Engine, app: string, steps: number): Promise<string[]> {
    // noinspection SqlNoDataSourceInspection
    const { rows } = await engine.query(
        `SELECT filename FROM migrations WHERE app = ? ORDER BY id DESC LIMIT ?`,
        [app, steps]
    );
    return (rows as any[]).map((r: any) => r.filename);
}

/** Drop all non-system tables. */
export async function dropAllTables(engine: Engine, verbose = false) {
    // noinspection SqlNoDataSourceInspection
    const { rows } = await engine.query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    for (const r of rows as any[]) {
        const name = r.name;
        if (verbose) console.log(`Dropping table: ${name}`);
        await applySQL(engine, `DROP TABLE IF EXISTS ${name};`, verbose);
    }
}

/** Print DB info (file path) if supported. */
export async function printDbInfo(engine: Engine, prefix = "") {
    try {
        // noinspection SqlNoDataSourceInspection
        const { rows } = await engine.query(`PRAGMA database_list`);
        const main = (rows as any[]).find((r) => (r.name || r['name']) === "main");
        if (main) {
            const file = (main.file ?? main['file']) ?? "";
            console.log(`${prefix}DB: main file=${file}`);
        }
    } catch {
        // ignore
    }
}
