import { execute, getDriver } from "../../../../../cortex/database/connection_manager";
import { toPgPlaceholders, toQMarkPlaceholders } from "../../../../../cortex/database/queryAdapter";

export type UserRow = {
    id: number;
    slug: string;
    name: string;
    email: string | null;
    meta: unknown | null;
    is_active: boolean | 0 | 1 | "0" | "1" | "t" | "f" | "true" | "false";
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type UserCreateInput = {
    slug: string;
    name: string;
    email?: string | null;
    meta?: unknown | null;
    is_active?: boolean;
};

export type UserUpdateInput = {
    name?: string;
    email?: string | null;
    meta?: unknown | null;
    is_active?: boolean;
};

function coerceBool(b: UserRow["is_active"]): boolean {
    if (typeof b === "boolean") return b;
    const s = String(b).toLowerCase();
    return s === "1" || s === "true" || s === "t";
}

function serializeMeta(v: unknown | null | undefined): unknown {
    if (v === undefined || v === null) return null;
    if (typeof v === "object") return JSON.stringify(v);
    return v;
}

function deserializeMeta(v: unknown): unknown {
    if (v == null) return null;
    if (typeof v === "string") {
        try {
            return JSON.parse(v);
        } catch {
            /* keep string */
        }
    }
    return v;
}

function mapRow(r: any): UserRow {
    return {
        ...r,
        is_active: coerceBool(r.is_active),
        meta: deserializeMeta(r.meta),
    };
}

export class UserRepo {
    static table = "users";

    /** Adapt placeholders based on driver */
    private static async adapt(sql: string): Promise<string> {
        const driver = await getDriver("default");
        if (driver === "postgres") return toPgPlaceholders(sql);
        return toQMarkPlaceholders(sql);
    }

    static async all(limit = 50, offset = 0): Promise<UserRow[]> {
        const sql = await this.adapt(`SELECT * FROM ${this.table}
                                      WHERE deleted_at IS NULL
                                      ORDER BY id DESC
                                          LIMIT ? OFFSET ?`);
        const res = await execute("default", sql, [limit, offset]);
        const rows = res.rows ?? [];
        return rows.map(mapRow);
    }

    static async count(): Promise<number> {
        const sql = await this.adapt(`SELECT COUNT(*) AS c FROM ${this.table} WHERE deleted_at IS NULL`);
        const res = await execute("default", sql);
        const row = res.rows?.[0] ?? {};
        const v = row.c ?? row.count ?? Object.values(row)[0];
        return Number(v || 0);
    }

    static async findById(id: number): Promise<UserRow | null> {
        const sql = await this.adapt(`SELECT * FROM ${this.table} WHERE id = ? AND deleted_at IS NULL`);
        console.log("[UserRepo.findById] sql:", sql, "params:", [id]);
        const res = await execute("default", sql, [id]);
        console.log("[UserRepo.findById] raw result:", res);
        const row = res.rows?.[0];
        return row ? mapRow(row) : null;
    }

    static async findBySlug(slug: string): Promise<UserRow | null> {
        const sql = await this.adapt(`SELECT * FROM ${this.table} WHERE slug = ? AND deleted_at IS NULL`);
        const res = await execute("default", sql, [slug]);
        const row = res.rows?.[0];
        return row ? mapRow(row) : null;
    }

    static async search(opts: { q?: string; active?: boolean; limit?: number; offset?: number } = {}): Promise<UserRow[]> {
        const { q, active, limit = 50, offset = 0 } = opts;

        const where: string[] = ["deleted_at IS NULL"];
        const params: any[] = [];

        if (typeof active === "boolean") {
            where.push("is_active = ?");
            params.push(active ? 1 : 0);
        }

        if (q && q.trim()) {
            where.push("(slug LIKE ? OR name LIKE ? OR email LIKE ?)");
            const pat = `%${q}%`;
            params.push(pat, pat, pat);
        }

        params.push(limit, offset);

        const sql = await this.adapt(`SELECT * FROM ${this.table}
                                      WHERE ${where.join(" AND ")}
                                      ORDER BY id DESC
                                          LIMIT ? OFFSET ?`);

        // 👇 Debug print
        console.log("[UserRepo.search] sql:", sql, "params:", params);

        const res = await execute("default", sql, params);
        const rows = res.rows ?? [];
        return rows.map(mapRow);
    }

    static async create(data: UserCreateInput): Promise<UserRow> {
        const now = new Date().toISOString();

        const sql = await this.adapt(`INSERT INTO ${this.table}
                                          (slug, name, email, meta, is_active, created_at, updated_at)
                                      VALUES (?, ?, ?, ?, ?, ?, ?)`);

        const params = [
            data.slug,
            data.name,
            data.email ?? null,
            serializeMeta(data.meta ?? null),
            data.is_active === undefined ? 1 : (data.is_active ? 1 : 0),
            now,
            now,
        ];

        const res = await execute("default", sql, params);
        console.log("[UserRepo.create] raw execute result:", res);

        // normalize insert ID across drivers
        let lastId: number | undefined;
        if (res.insertId !== undefined) lastId = Number(res.insertId);
        else if (res.lastID !== undefined) lastId = Number(res.lastID);
        else if (res.lastInsertRowid !== undefined) lastId = Number(res.lastInsertRowid);

        console.log("[UserRepo.create] normalized lastId:", lastId);

        if (lastId) {
            const row = await this.findById(lastId);
            console.log("[UserRepo.create] findById result:", row);
            if (row) return row;
        }

        const row = await this.findBySlug(data.slug);
        console.log("[UserRepo.create] fallback findBySlug result:", row);
        if (!row) {
            console.error("[UserRepo.create] Insert failed, res:", res);
            throw new Error("Failed to load created user");
        }
        return row;
    }

    static async update(id: number, data: UserUpdateInput): Promise<UserRow | null> {
        const sets: string[] = [];
        const vals: any[] = [];

        if (data.name !== undefined) {
            sets.push("name = ?");
            vals.push(data.name);
        }
        if (data.email !== undefined) {
            sets.push("email = ?");
            vals.push(data.email ?? null);
        }
        if (data.meta !== undefined) {
            sets.push("meta = ?");
            vals.push(serializeMeta(data.meta));
        }
        if (data.is_active !== undefined) {
            sets.push("is_active = ?");
            vals.push(data.is_active ? 1 : 0);
        }

        if (!sets.length) return this.findById(id);

        sets.push("updated_at = ?");
        vals.push(new Date().toISOString());
        vals.push(id);

        const sql = await this.adapt(`UPDATE ${this.table}
                                      SET ${sets.join(", ")}
                                      WHERE id = ? AND deleted_at IS NULL`);

        await execute("default", sql, vals);
        return this.findById(id);
    }

    static async softDelete(id: number): Promise<boolean> {
        const now = new Date().toISOString();
        const sql = await this.adapt(`UPDATE users
                                      SET deleted_at = ?
                                      WHERE id = ? AND deleted_at IS NULL`);

        const res = await execute("default", sql, [now, id]);
        const changes = res?.rowCount ?? res?.affectedRows ?? res?.changes ?? 0;

        if (!changes) {
            const after = await this.findById(id);
            return after === null;
        }
        return true;
    }
}
