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

/** Safely literalize a JS value for SQL across pg/mysql/sqlite. */
function sqlLiteral(v: unknown): string {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (v instanceof Date) {
        // ISO-ish without 'Z' (let the DB interpret as local/UTC per engine)
        const iso = v.toISOString().replace("T", " ").replace("Z", "");
        return `'${iso.replace(/'/g, "''")}'`;
    }
    // string or other: stringify & escape single quotes
    const s = String(v).replace(/'/g, "''");
    return `'${s}'`;
}

/** Create migrations table with `batch`; try to upgrade older tables (no batch). */
export async function ensureMigrationsTable(conn: ConnectionLike) {
    const createSql = `
    CREATE TABLE IF NOT EXISTS migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      batch       INTEGER NOT NULL,
      checksum    VARCHAR(64) NOT NULL,
      applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await exec(conn, createSql);

    // Add batch column if missing (best-effort; harmless if already exists)
    try {
        await exec(conn, `ALTER TABLE migrations ADD COLUMN batch INTEGER NOT NULL DEFAULT 1;`);
    } catch { /* ignore */ }

    try {
        await exec(conn, `UPDATE migrations SET batch = 1 WHERE batch IS NULL;`);
    } catch { /* ignore */ }
}

export type AppliedRow = { filename: string; batch: number; checksum: string; applied_at?: any };

/** Read all applied, ordered stably. */
export async function readAppliedAll(conn: ConnectionLike): Promise<AppliedRow[]> {
    const sql = `SELECT filename, batch, checksum, applied_at FROM migrations ORDER BY batch ASC, applied_at ASC, filename ASC;`;

    let res: any;
    if (typeof conn.query === "function") res = await conn.query(sql);
    else if (typeof conn.execute === "function") res = await conn.execute(sql);
    else return [];

    let rows: any[] = [];
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];               // mysql2
    else if (Array.isArray(res)) rows = res;                                      // misc drivers
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;   // pg

    return rows.map((r) => ({
        filename: r.filename ?? r.FILENAME ?? r[0],
        batch: Number(r.batch ?? r.BATCH ?? r[1] ?? 1),
        checksum: r.checksum ?? r.CHECKSUM ?? r[2] ?? "",
        applied_at: r.applied_at ?? r.APPLIED_AT ?? r[3],
    })).filter((r) => typeof r.filename === "string");
}

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
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];
    else if (Array.isArray(res)) rows = res;
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;

    const val = rows[0]?.max_batch ?? rows[0]?.MAX_BATCH ?? rows[0]?.[0] ?? null;
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

/** Upsert an applied migration in a specific batch (portable: inline literals). */
export async function recordApplied(conn: ConnectionLike, filename: string, content: string, batch: number) {
    const checksumHex = sha256(content);
    const sqlInsert = `
    INSERT INTO migrations (filename, batch, checksum)
    VALUES (${sqlLiteral(filename)}, ${sqlLiteral(batch)}, ${sqlLiteral(checksumHex)});
  `;
    try {
        await exec(conn, sqlInsert);
        return;
    } catch {
        const sqlUpdate = `
      UPDATE migrations
      SET batch = ${sqlLiteral(batch)}, checksum = ${sqlLiteral(checksumHex)}
      WHERE filename = ${sqlLiteral(filename)};
    `;
        await exec(conn, sqlUpdate);
    }
}

/** Remove applied record (portable: inline literals). */
export async function removeApplied(conn: ConnectionLike, filename: string) {
    const sql = `DELETE FROM migrations WHERE filename = ${sqlLiteral(filename)};`;
    await exec(conn, sql);
}
