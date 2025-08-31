// cortex/repos/TenantRepo.ts
import { getConnection } from '../../../../cortex/database/connection_manager';

export type TenantRow = {
    id: number;
    slug: string;
    name: string;
    email: string | null;
    meta: unknown | null;
    is_active: boolean | 0 | 1 | "0" | "1" | "t" | "f" | "true" | "false";
    created_at: string; // or Date depending on driver
    updated_at: string;
    deleted_at: string | null;
};

export type TenantCreateInput = {
    slug: string;
    name: string;
    email?: string | null;
    meta?: unknown | null;
    is_active?: boolean; // default true at validator/migration level
};

export type TenantUpdateInput = {
    name?: string;
    email?: string | null;
    meta?: unknown | null;
    is_active?: boolean;
};

function coerceBool(b: TenantRow["is_active"]): boolean {
    if (typeof b === "boolean") return b;
    const s = String(b).toLowerCase();
    return s === "1" || s === "true" || s === "t";
}

function serializeMeta(v: unknown | null | undefined): unknown {
    if (v === undefined) return null;
    if (v === null) return null;
    // Most drivers accept JSON directly; SQLite/MySQL often store as TEXT/JSON.
    // To be safe across engines, stringify objects/arrays.
    if (typeof v === "object") return JSON.stringify(v);
    return v;
}

function deserializeMeta(v: unknown): unknown {
    if (v == null) return null;
    if (typeof v === "string") {
        try { return JSON.parse(v); } catch { /* keep as string */ }
    }
    return v;
}

// --- tiny driver-agnostic helpers ------------------------------------------
async function qAll(conn: any, sql: string, params: any[] = []) {
    if (typeof conn.all === "function") return conn.all(sql, params);
    if (typeof conn.query === "function") return conn.query(sql, params);
    throw new Error("Connection does not support all/query");
}

async function qGet(conn: any, sql: string, params: any[] = []) {
    if (typeof conn.get === "function") return conn.get(sql, params);
    if (typeof conn.query === "function") {
        const rows = await conn.query(sql, params);
        return rows?.[0] ?? null;
    }
    throw new Error("Connection does not support get/query");
}

async function qRun(conn: any, sql: string, params: any[] = []) {
    if (typeof conn.run === "function") return conn.run(sql, params);
    if (typeof conn.execute === "function") return conn.execute(sql, params);
    // Some clients only expose query for mutations
    if (typeof conn.query === "function") return conn.query(sql, params);
    throw new Error("Connection does not support run/execute/query");
}

function mapRow(r: any): TenantRow {
    return {
        ...r,
        is_active: coerceBool(r.is_active),
        meta: deserializeMeta(r.meta),
    };
}

// ----------------------------------------------------------------------------

export class TenantRepo {
    static table = "tenants";

    /** List non-deleted tenants, newest first */
    static async all(limit = 50, offset = 0): Promise<TenantRow[]> {
        const conn = await getConnection();
        const sql = `SELECT * FROM ${this.table}
                 WHERE deleted_at IS NULL
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?`;
        const rows = await qAll(conn, sql, [limit, offset]);
        return rows.map(mapRow);
    }

    static async count(): Promise<number> {
        const conn = await getConnection();
        const sql = `SELECT COUNT(*) AS c FROM ${this.table} WHERE deleted_at IS NULL`;
        const row = await qGet(conn, sql);
        const v = row?.c ?? row?.count ?? Object.values(row ?? {})[0];
        return Number(v || 0);
    }

    static async findById(id: number): Promise<TenantRow | null> {
        const conn = await getConnection();
        const sql = `SELECT * FROM ${this.table} WHERE id = ? AND deleted_at IS NULL`;
        const row = await qGet(conn, sql, [id]);
        return row ? mapRow(row) : null;
    }

    static async findBySlug(slug: string): Promise<TenantRow | null> {
        const conn = await getConnection();
        const sql = `SELECT * FROM ${this.table} WHERE slug = ? AND deleted_at IS NULL`;
        const row = await qGet(conn, sql, [slug]);
        return row ? mapRow(row) : null;
    }

    /** Basic search on slug/name/email with optional active filter */
    static async search(opts: {
        q?: string;
        active?: boolean;
        limit?: number;
        offset?: number;
    } = {}): Promise<TenantRow[]> {
        const { q, active, limit = 50, offset = 0 } = opts;
        const conn = await getConnection();

        const where: string[] = ["deleted_at IS NULL"];
        const params: any[] = [];

        if (typeof active === "boolean") {
            where.push("is_active = ?");
            params.push(active ? 1 : 0);
        }

        if (q && q.trim()) {
            // Use LIKE for cross-dialect match; switch to ILIKE if you normalize for PG.
            where.push("(slug LIKE ? OR name LIKE ? OR email LIKE ?)");
            const pat = `%${q}%`;
            params.push(pat, pat, pat);
        }

        const sql = `SELECT * FROM ${this.table}
                 WHERE ${where.join(" AND ")}
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const rows = await qAll(conn, sql, params);
        return rows.map(mapRow);
    }

    static async create(data: TenantCreateInput): Promise<TenantRow> {
        const conn = await getConnection();
        const now = new Date().toISOString();

        const sql = `INSERT INTO ${this.table}
      (slug, name, email, meta, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            data.slug,
            data.name,
            data.email ?? null,
            serializeMeta(data.meta ?? null),
            data.is_active === undefined ? 1 : (data.is_active ? 1 : 0),
            now,
            now,
        ];

        const res = await qRun(conn, sql, params);

        // Pull back created row; prefer last insert id if available, else lookup by slug
        const lastId: number | undefined =
            (res && (res.lastID ?? res.insertId)) !== undefined
                ? Number(res.lastID ?? res.insertId)
                : undefined;

        if (lastId) {
            const row = await this.findById(lastId);
            if (row) return row;
        }
        const row = await this.findBySlug(data.slug);
        if (!row) throw new Error("Failed to load created tenant");
        return row;
    }

    static async update(id: number, data: TenantUpdateInput): Promise<TenantRow | null> {
        const conn = await getConnection();
        const sets: string[] = [];
        const vals: any[] = [];

        if (data.name !== undefined) { sets.push("name = ?"); vals.push(data.name); }
        if (data.email !== undefined) { sets.push("email = ?"); vals.push(data.email ?? null); }
        if (data.meta !== undefined) { sets.push("meta = ?"); vals.push(serializeMeta(data.meta)); }
        if (data.is_active !== undefined) { sets.push("is_active = ?"); vals.push(data.is_active ? 1 : 0); }

        // nothing to do
        if (!sets.length) return this.findById(id);

        sets.push("updated_at = ?");
        vals.push(new Date().toISOString());

        const sql = `UPDATE ${this.table}
                 SET ${sets.join(", ")}
                 WHERE id = ? AND deleted_at IS NULL`;
        vals.push(id);

        await qRun(conn, sql, vals);
        return this.findById(id);
    }

    static async softDelete(id: number): Promise<boolean> {
        const conn = await getConnection();
        const now = new Date().toISOString();
        const sql = `UPDATE ${this.table}
                 SET deleted_at = ?
                 WHERE id = ? AND deleted_at IS NULL`;
        const res = await qRun(conn, sql, [now, id]);
        const changes = (res?.changes ?? res?.affectedRows ?? 0);
        // If driver doesn't return changes, fall back to a read:
        if (changes === 0) {
            const after = await this.findById(id);
            return after === null; // not found anymore -> treated as deleted or already deleted
        }
        return changes > 0;
    }
}
