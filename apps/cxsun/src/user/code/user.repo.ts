import { getUserTableDDL, dropUserTableDDL } from "./user.table";

export type UserRecord = {
    id: number;
    name: string;
    email: string | null;
    password: string;
    is_active: boolean;
    created_at: string; // ISO string
};

export interface IConnection {
    driver: string;
    query<T = any>(
        sql: string,
        params?: unknown[]
    ): Promise<{ rows: T[] } | T[]>;
}

export class UserRepo {
    private db: IConnection;

    constructor(db: IConnection) {
        this.db = db;
    }

    async ensureTable(): Promise<void> {
        const sql = getUserTableDDL(this.db.driver);
        await this.exec(sql);
    }

    async dropTable(): Promise<void> {
        const sql = dropUserTableDDL();
        await this.exec(sql);
    }

    async findAll(limit = 100, offset = 0): Promise<UserRecord[]> {
        const sql = `SELECT id, name, email, password, is_active, created_at FROM users ORDER BY id LIMIT ? OFFSET ?`;
        return this.rows<UserRecord>(sql, [limit, offset]);
    }

    async findById(id: number): Promise<UserRecord | null> {
        const sql = `SELECT id, name, email, password, is_active, created_at FROM users WHERE id = ? LIMIT 1`;
        const rows = await this.rows<UserRecord>(sql, [id]);
        return rows[0] ?? null;
    }

    async findByEmail(email: string): Promise<UserRecord | null> {
        const sql = `SELECT id, name, email, password, is_active, created_at FROM users WHERE email = ? LIMIT 1`;
        const rows = await this.rows<UserRecord>(sql, [email]);
        return rows[0] ?? null;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const sql = `SELECT 1 AS x FROM users WHERE email = ? LIMIT 1`;
        const rows = await this.rows<{ x: number }>(sql, [email]);
        return rows.length > 0;
    }

    async create(input: {
        name: string;
        email: string;
        password: string;
        is_active: boolean;
    }): Promise<UserRecord> {
        const sql = `INSERT INTO users (name, email, password, is_active) VALUES (?, ?, ?, ?)`;
        await this.exec(sql, [
            input.name,
            input.email,
            input.password,
            input.is_active,
        ]);

        const created = await this.rows<UserRecord>(
            `SELECT id, name, email, password, is_active, created_at FROM users ORDER BY id DESC LIMIT 1`
        );
        if (!created[0]) {
            throw new Error("Failed to retrieve inserted user");
        }
        return created[0];
    }

    async update(
        id: number,
        patch: Partial<Omit<UserRecord, "id" | "created_at">>
    ): Promise<UserRecord | null> {
        const sets: string[] = [];
        const params: unknown[] = [];

        if (patch.name !== undefined) {
            sets.push(`name = ?`);
            params.push(patch.name);
        }
        if (patch.email !== undefined) {
            sets.push(`email = ?`);
            params.push(patch.email);
        }
        if (patch.password !== undefined) {
            sets.push(`password = ?`);
            params.push(patch.password);
        }
        if (patch.is_active !== undefined) {
            sets.push(`is_active = ?`);
            params.push(patch.is_active);
        }

        if (sets.length === 0) {
            return this.findById(id);
        }

        const sql = `UPDATE users SET ${sets.join(", ")} WHERE id = ?`;
        params.push(id);
        await this.exec(sql, params);

        return this.findById(id);
    }

    async remove(id: number): Promise<boolean> {
        const sql = `DELETE FROM users WHERE id = ?`;
        await this.exec(sql, [id]);
        const still = await this.findById(id);
        return !still;
    }

    // ---------- private helpers ----------

    private async rows<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
        const res = await this.db.query<T>(sql, params);
        if (Array.isArray(res)) return res as T[];
        return res.rows as T[];
    }

    private async exec(sql: string, params?: unknown[]): Promise<void> {
        await this.db.query(sql, params);
    }
}

export default UserRepo;
