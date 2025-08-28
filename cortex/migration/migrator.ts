/**
 * Shared migration utilities for codexsun.
 */

import fs from "node:fs";
import path from "node:path";

/** apps/<app>/database/migrations */
export function appMigrationDir(appName: string) {
    return path.join(process.cwd(), "apps", appName, "database", "migrations");
}

/** Naive multi-statement splitter (OK for simple .sql). */
export function splitSQL(sql: string): string[] {
    return sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => s + ";");
}

/** Execute SQL across various sqlite drivers (exec/run/query). */
export async function applySQL(db: any, sql: string) {
    if (typeof db.exec === "function") {
        return db.exec(sql);
    }
    const stmts = splitSQL(sql);
    for (const stmt of stmts) {
        if (typeof db.run === "function") {
            await db.run(stmt);
        } else if (typeof db.query === "function") {
            await db.query(stmt);
        } else {
            throw new TypeError("DB handle does not support exec/run/query");
        }
    }
}

/** Ensure the shared migrations ledger table exists. */
export async function ensureMigrationsTable(db: any) {
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
    await applySQL(db, createSQL);
}

/** Check if a migration file is already applied for an app. */
export async function hasApplied(db: any, app: string, file: string): Promise<boolean> {
    if (typeof db.get === "function") {
        // noinspection SqlNoDataSourceInspection
        const row = await db.get(
            `SELECT 1 AS ok FROM migrations WHERE app = ? AND filename = ?`,
            [app, file]
        );
        return !!row;
    }
    if (typeof db.all === "function") {
        // noinspection SqlNoDataSourceInspection
        const rows = await db.all(
            `SELECT 1 AS ok FROM migrations WHERE app = ? AND filename = ?`,
            [app, file]
        );
        if (!rows) return false;
        if (Array.isArray(rows)) return rows.length > 0;
        if (typeof rows === "object" && "length" in rows) return (rows as any).length > 0;
        return true;
    }
    if (typeof db.query === "function") {
        // noinspection SqlNoDataSourceInspection
        const rows = await db.query(
            `SELECT 1 AS ok FROM migrations WHERE app = ? AND filename = ?`,
            [app, file]
        );
        if (Array.isArray(rows)) return rows.length > 0;
        if (rows && typeof rows === "object" && "length" in rows) return (rows as any).length > 0;
        return !!rows;
    }
    throw new TypeError("DB handle does not support get/all/query");
}

/** Mark a migration as applied. */
export async function markApplied(db: any, app: string, file: string) {
    if (typeof db.run === "function") {
        // noinspection SqlNoDataSourceInspection
        await db.run(`INSERT INTO migrations (app, filename) VALUES (?, ?)`, [app, file]);
        return;
    }
    if (typeof db.query === "function") {
        // noinspection SqlNoDataSourceInspection
        await db.query(`INSERT INTO migrations (app, filename) VALUES (?, ?)`, [app, file]);
        return;
    }
    throw new TypeError("DB handle does not support run/query");
}

/** Return the last N applied filenames for an app (DESC by id). */
export async function lastApplied(db: any, app: string, steps: number): Promise<string[]> {
    // Prefer .all but fall back to .query
    const sql = `SELECT filename FROM migrations WHERE app = ? ORDER BY id DESC LIMIT ?`;
    let rows: any = null;

    if (typeof db.all === "function") {
        // noinspection SqlNoDataSourceInspection
        rows = await db.all(sql, [app, steps]);
    } else if (typeof db.query === "function") {
        // noinspection SqlNoDataSourceInspection
        rows = await db.query(sql, [app, steps]);
    } else {
        throw new TypeError("DB handle does not support all/query for lastApplied()");
    }

    if (!rows) return [];
    if (Array.isArray(rows)) return rows.map((r) => r.filename);
    if (typeof rows === "object" && "length" in rows) {
        return Array.from(rows as any).map((r: any) => r.filename);
    }
    // Single row object fallback
    return rows.filename ? [rows.filename] : [];
}

/** Drop all non-system tables. */
export async function dropAllTables(db: any) {
    // noinspection SqlNoDataSourceInspection
    const rows =
        (await db.all?.(
            `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
        )) || [];
    for (const r of rows) {
        const name = r.name;
        // noinspection SqlNoDataSourceInspection
        await applySQL(db, `DROP TABLE IF EXISTS ${name};`);
    }
}

/** Discover all apps (directories) under ./apps */
export function discoverAllApps(): string[] {
    const appsRoot = path.join(process.cwd(), "apps");
    if (!fs.existsSync(appsRoot)) return [];
    return fs
        .readdirSync(appsRoot, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
}

/** List sorted .sql files from an app’s migrations folder. */
export function listMigrationFiles(appName: string): string[] {
    const dir = appMigrationDir(appName);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
}

/** Build the absolute path for a migration file. */
export function migrationPath(appName: string, fileName: string): string {
    return path.join(appMigrationDir(appName), fileName);
}
