import crypto from "crypto";

export type ConnectionLike = {
    query?: (sql: string, params?: any[]) => Promise<any>;
    execute?: (sql: string, params?: any[]) => Promise<any>;
    run?: (sql: string, params?: any[]) => Promise<any>;
};

type DBDriver = "mariadb" | "postgres" | "sqlite";

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
        const iso = v.toISOString().replace("T", " ").replace("Z", "");
        return `'${iso.replace(/'/g, "''")}'`;
    }
    const s = String(v).replace(/'/g, "''");
    return `'${s}'`;
}

/** Normalize a path to a portable form safe for all drivers (especially MySQL on Windows). */
function toPortablePath(p: string): string {
    // Windows accepts forward slashes; Linux/macOS already use them.
    // Avoid backslashes because MySQL treats "\" as an escape in string literals.
    return p.replace(/\\/g, "/");
}

/**
 * Ensure migrations table exists and is compatible across drivers.
 * Standardized schema:
 *   model      VARCHAR(191) PRIMARY KEY
 *   filename   VARCHAR(1024) NOT NULL
 *   batch      INTEGER NOT NULL
 *   checksum   VARCHAR(64) NOT NULL
 *   applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 */
export async function ensureMigrationsTable(conn: ConnectionLike, driver?: DBDriver) {
    const createSql = `
    CREATE TABLE IF NOT EXISTS migrations (
      model       VARCHAR(191) PRIMARY KEY,
      filename    VARCHAR(1024) NOT NULL,
      batch       INTEGER NOT NULL,
      checksum    VARCHAR(64) NOT NULL,
      applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await exec(conn, createSql);

    // Best-effort upgrades (ignore if already correct)
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN model VARCHAR(191)`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN filename VARCHAR(1024)`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN batch INTEGER NOT NULL DEFAULT 1`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN checksum VARCHAR(64)`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); } catch {}

    // Driver-specific normalization
    try {
        if (driver === "mariadb") {
            await exec(conn, `ALTER TABLE migrations MODIFY COLUMN filename VARCHAR(1024) NOT NULL`);
            await exec(conn, `ALTER TABLE migrations MODIFY COLUMN model VARCHAR(191) NOT NULL`);
        } else if (driver === "postgres") {
            await exec(conn, `ALTER TABLE migrations ALTER COLUMN filename TYPE VARCHAR(1024)`);
            await exec(conn, `ALTER TABLE migrations ALTER COLUMN model TYPE VARCHAR(191)`);
        }
    } catch {}
}

export type AppliedRow = {
    model: string;
    filename: string; // stored as portable path with forward slashes
    batch: number;
    checksum: string;
    applied_at?: any;
};

export async function readAppliedAll(conn: ConnectionLike): Promise<AppliedRow[]> {
    const sql = `SELECT model, filename, batch, checksum, applied_at
                 FROM migrations
                 ORDER BY batch ASC, applied_at ASC, model ASC;`;

    let res: any;
    if (typeof conn.query === "function") res = await conn.query(sql);
    else if (typeof conn.execute === "function") res = await conn.execute(sql);
    else return [];

    let rows: any[] = [];
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];               // mysql2
    else if (Array.isArray(res)) rows = res;                                      // misc
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;   // pg

    return rows.map((r) => ({
        model: r.model ?? r.MODEL ?? r[0],
        filename: (r.filename ?? r.FILENAME ?? r[1]) as string,
        batch: Number(r.batch ?? r.BATCH ?? r[2] ?? 1),
        checksum: r.checksum ?? r.CHECKSUM ?? r[3] ?? "",
        applied_at: r.applied_at ?? r.APPLIED_AT ?? r[4],
    })).filter((r) => typeof r.model === "string");
}

export async function readAppliedModelSet(conn: ConnectionLike): Promise<Set<string>> {
    const rows = await readAppliedAll(conn);
    return new Set(rows.map((r) => r.model));
}

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

/** Upsert by MODEL (PK), store filename as portable path (forward slashes). */
export async function recordApplied(
    conn: ConnectionLike,
    file: string,
    content: string,
    batch: number,
    model: string
) {
    const checksumHex = sha256(content);
    const portable = toPortablePath(file);

    const sqlInsert = `
    INSERT INTO migrations (model, filename, batch, checksum)
    VALUES (${sqlLiteral(model)}, ${sqlLiteral(portable)}, ${sqlLiteral(batch)}, ${sqlLiteral(checksumHex)});
  `;
    try {
        await exec(conn, sqlInsert);
        return;
    } catch {
        const sqlUpdate = `
            UPDATE migrations
            SET filename = ${sqlLiteral(portable)},
                batch = ${sqlLiteral(batch)},
                checksum = ${sqlLiteral(checksumHex)}
            WHERE model = ${sqlLiteral(model)};
        `;
        await exec(conn, sqlUpdate);
    }
}

export async function removeApplied(conn: ConnectionLike, model: string) {
    const sql = `DELETE FROM migrations WHERE model = ${sqlLiteral(model)};`;
    await exec(conn, sql);
}
