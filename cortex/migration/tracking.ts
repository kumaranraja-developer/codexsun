// cortex/migration/tracking.ts

import crypto from "crypto";

export type ConnectionLike = {
    query?: (sql: string, params?: any[]) => Promise<any>;
    execute?: (sql: string, params?: any[]) => Promise<any>;
    run?: (sql: string, params?: any[]) => Promise<any>;
};

async function exec(conn: ConnectionLike, sql: string, params: any[] = []) {
    if (typeof conn.query === "function") return conn.query(sql, params);
    if (typeof conn.execute === "function") return conn.execute(sql, params);
    if (typeof conn.run === "function") return conn.run(sql, params);
    throw new Error("tracking.exec: no query/execute/run on connection");
}

export function sha256(s: string): string {
    return crypto.createHash("sha256").update(s).digest("hex");
}

/** Create migrations table with `batch`; try to upgrade older tables (no batch). */
export async function ensureMigrationsTable(conn: ConnectionLike) {
    // Create with `batch`
    const createSql = `
    CREATE TABLE IF NOT EXISTS migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      batch       INTEGER NOT NULL,
      checksum    VARCHAR(64) NOT NULL,
      applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await exec(conn, createSql);

    // Attempt to add batch if it doesn't exist (portable enough for sqlite/mariadb/pg)
    try {
        await exec(conn, `ALTER TABLE migrations ADD COLUMN batch INTEGER NOT NULL DEFAULT 1;`);
    } catch {
        // ignore if exists / not supported
    }

    // Ensure no NULL batches remain
    try {
        await exec(conn, `UPDATE migrations SET batch = 1 WHERE batch IS NULL;`);
    } catch {
        // ignore
    }
}

/** Applied row shape (batch-centric). */
export type AppliedRow = {
    filename: string;
    batch: number;
    checksum: string;
    applied_at?: any;
};

/** Read all applied, ordered by (batch asc, applied_at asc, filename asc). */
export async function readAppliedAll(conn: ConnectionLike): Promise<AppliedRow[]> {
    const sql = `SELECT filename, batch, checksum, applied_at FROM migrations ORDER BY batch ASC, applied_at ASC, filename ASC;`;

    let res: any;
    if (typeof conn.query === "function") res = await conn.query(sql);
    else if (typeof conn.execute === "function") res = await conn.execute(sql);
    else return [];

    let rows: any[] = [];
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];               // mysql2
    else if (Array.isArray(res)) rows = res;                                      // misc
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;   // pg

    return rows.map((r) => ({
        filename: r.filename ?? r.FILENAME ?? r[0],
        batch: Number(r.batch ?? r.BATCH ?? r[1] ?? 1),
        checksum: r.checksum ?? r.CHECKSUM ?? r[2] ?? "",
        applied_at: r.applied_at ?? r.APPLIED_AT ?? r[3],
    })).filter((r) => typeof r.filename === "string");
}

/** Fast set of filenames already applied. */
export async function readAppliedSet(conn: ConnectionLike): Promise<Set<string>> {
    const rows = await readAppliedAll(conn);
    return new Set(rows.map((r) => r.filename));
}

/** Current max batch number. */
export async function currentBatch(conn: ConnectionLike): Promise<number> {
    let res: any;
    if (typeof conn.query === "function") res = await conn.query(`SELECT MAX(batch) AS max_batch FROM migrations;`);
    else if (typeof conn.execute === "function") res = await conn.execute(`SELECT MAX(batch) AS max_batch FROM migrations;`);
    else return 0;

    let rows: any[] = [];
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];               // mysql2
    else if (Array.isArray(res)) rows = res;
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;   // pg

    const val = rows[0]?.max_batch ?? rows[0]?.MAX_BATCH ?? rows[0]?.[0] ?? null;
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

/** Upsert an applied migration in a specific batch. */
export async function recordApplied(conn: ConnectionLike, filename: string, content: string, batch: number) {
    const checksumHex = sha256(content);
    try {
        await exec(conn, `INSERT INTO migrations (filename, batch, checksum) VALUES (?, ?, ?)`, [filename, batch, checksumHex]);
    } catch {
        await exec(conn, `UPDATE migrations SET batch = ?, checksum = ? WHERE filename = ?`, [batch, checksumHex, filename]);
    }
}

/** Remove applied record (for down/rollback). */
export async function removeApplied(conn: ConnectionLike, filename: string) {
    await exec(conn, `DELETE FROM migrations WHERE filename = ?`, [filename]);
}
