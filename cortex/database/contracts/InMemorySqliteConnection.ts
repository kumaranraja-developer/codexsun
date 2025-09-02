import sqlite3 from "sqlite3";

export class InMemorySqliteConnection {
    driver = "sqlite";
    private db: any;

    constructor() {
        this.db = new sqlite3.Database(":memory:");
        this.db.exec("PRAGMA foreign_keys = ON");
    }

    async query<T = any>(
        sql: string,
        params?: unknown[]
    ): Promise<{ rows: T[] }> {
        const lowered = sql.trim().toLowerCase();
        if (lowered.startsWith("select")) {
            return { rows: await this.fetchAll<T>(sql, params) };
        } else {
            await this.execute(sql, params);
            return { rows: [] };
        }
    }

    private execute<T = any>(sql: string, params?: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params || [], function (this: any, err: any) {
                if (err) return reject(err);
                resolve({ changes: this.changes, lastID: this.lastID } as T);
            });
        });
    }

    private fetchAll<T = any>(sql: string, params?: any[]): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params || [], (err: any, rows: any[]) => {
                if (err) return reject(err);
                resolve((rows as T[]) ?? []);
            });
        });
    }

    async end(): Promise<void> {
        return new Promise((resolve, reject) =>
            this.db.close((e: any) => (e ? reject(e) : resolve()))
        );
    }
}