// cortex/migration/tracking.ts
import crypto from "crypto";

/** Minimal driver tag */
export type DBDriver = "mariadb" | "postgres" | "sqlite";

/** Duck-typed connection that covers mariadb/mysql2, pg, sqlite3, better-sqlite3 */
export type ConnectionLike = {
    // mysql2 / mariadb / pg
    query?: (sql: string, params?: any[]) => Promise<any>;
    execute?: (sql: string, params?: any[]) => Promise<any>;

    // node-sqlite3 style
    run?: (sql: string, params?: any[]) => Promise<any>;

    // better-sqlite3 (sync API)
    exec?: (sql: string) => any;
    prepare?: (sql: string) => any; // stmt with .run/.all/.get (unknown at type level)
};

/** Internal exec that tolerates mysql2/pg/sqlite3/better-sqlite3. */
async function exec(conn: ConnectionLike, sql: string, params: any[] = []) {
    if (typeof conn.query === "function") return conn.query(sql, params);
    if (typeof conn.execute === "function") return conn.execute(sql, params);
    if (typeof conn.run === "function") return conn.run(sql, params);

    // better-sqlite3: prefer .exec for simple SQL without params
    if (typeof conn.exec === "function" && (!params || params.length === 0)) {
        conn.exec(sql);
        return;
    }
    if (typeof conn.prepare === "function") {
        const stmt: any = conn.prepare(sql);
        if (stmt && typeof stmt.run === "function") return stmt.run(...(Array.isArray(params) ? params : []));
        if (stmt && typeof stmt.all === "function") return stmt.all(...(Array.isArray(params) ? params : []));
        if (stmt && typeof stmt.get === "function") return stmt.get(...(Array.isArray(params) ? params : []));
    }
    throw new Error("tracking.exec: no query/execute/run on connection");
}

/** Hash helper used for checksums. */
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

/** Normalize path separators to forward slashes (avoid MySQL backslash escapes). */
function toPortablePath(p: string): string {
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

    // best-effort upgrades (ignore if already present / correct)
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN model VARCHAR(191)`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN filename VARCHAR(1024)`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN batch INTEGER NOT NULL DEFAULT 1`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN checksum VARCHAR(64)`); } catch {}
    try { await exec(conn, `ALTER TABLE migrations ADD COLUMN applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); } catch {}

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
    filename: string; // stored portable (forward slashes)
    batch: number;
    checksum: string;
    applied_at?: any;
};

export async function readAppliedAll(conn: ConnectionLike): Promise<AppliedRow[]> {
    const sql = `SELECT model, filename, batch, checksum, applied_at
                 FROM migrations
                 ORDER BY batch ASC, applied_at ASC, model ASC;`;

    let res: any;
    if (typeof conn.query === "function") {
        res = await conn.query(sql);
    } else if (typeof conn.execute === "function") {
        res = await conn.execute(sql);
    } else if (typeof (conn as any).prepare === "function") {
        const stmt: any = (conn as any).prepare(sql);
        if (stmt && typeof stmt.all === "function") {
            res = stmt.all();
        } else if (stmt && typeof stmt.get === "function") {
            const row = stmt.get();
            res = row ? [row] : [];
        } else if (stmt && typeof stmt.run === "function") {
            stmt.run();
            res = [];
        } else {
            return [];
        }
    } else {
        return [];
    }

    let rows: any[] = [];
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];               // mysql2
    else if (Array.isArray(res)) rows = res;                                      // better-sqlite3 .all()
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;   // pg

    return rows
        .map((r) => ({
            model: r.model ?? r.MODEL ?? r[0],
            filename: (r.filename ?? r.FILENAME ?? r[1]) as string,
            batch: Number(r.batch ?? r.BATCH ?? r[2] ?? 1),
            checksum: r.checksum ?? r.CHECKSUM ?? r[3] ?? "",
            applied_at: r.applied_at ?? r.APPLIED_AT ?? r[4],
        }))
        .filter((r) => typeof r.model === "string");
}

export async function readAppliedModelSet(conn: ConnectionLike): Promise<Set<string>> {
    const rows = await readAppliedAll(conn);
    return new Set(rows.map((r) => r.model));
}

export async function currentBatch(conn: ConnectionLike): Promise<number> {
    let res: any;
    if (typeof conn.query === "function") {
        res = await conn.query(`SELECT MAX(batch) AS max_batch FROM migrations;`);
    } else if (typeof conn.execute === "function") {
        res = await conn.execute(`SELECT MAX(batch) AS max_batch FROM migrations;`);
    } else if (typeof (conn as any).prepare === "function") {
        const stmt: any = (conn as any).prepare(`SELECT MAX(batch) AS max_batch FROM migrations;`);
        if (stmt && typeof stmt.get === "function") {
            res = stmt.get(); // single row
        } else if (stmt && typeof stmt.all === "function") {
            const rows = stmt.all();
            res = Array.isArray(rows) && rows.length ? rows[0] : { max_batch: null };
        } else if (stmt && typeof stmt.run === "function") {
            stmt.run(); // defensive
            res = { max_batch: null };
        } else {
            return 0;
        }
    } else {
        return 0;
    }

    let rows: any[] = [];
    if (Array.isArray(res) && Array.isArray(res[0])) rows = res[0];
    else if (Array.isArray(res)) rows = res;
    else if (res && Array.isArray((res as any).rows)) rows = (res as any).rows;
    else if (res && typeof res === "object") rows = [res]; // better-sqlite3 .get()

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
