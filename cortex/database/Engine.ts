// Shared Engine contract (profile-based, no tenant)
export type MaybePromise<T> = T | Promise<T>;

export interface QueryResult<T = any> {
    rows?: T[];
    row?: T | null;
    affected?: number | null;  // INSERT/UPDATE/DELETE
}

export interface Engine {
    readonly profile: string;
    readonly driver: 'mariadb' | 'postgres' | 'sqlite' | 'mysql' | 'mongodb';
    readonly cfgKey: string;

    // Lifecycle
    connect(): MaybePromise<void>;

    close(): MaybePromise<void>;

    testConnection(): MaybePromise<boolean>;

    // Low-level
    getConnection(): unknown | Promise<unknown>;

    // Exec
    execute(sql: string, params?: unknown): MaybePromise<number | null>;

    fetchOne<T = any>(sql: string, params?: unknown): MaybePromise<T | null>;

    fetchAll<T = any>(sql: string, params?: unknown): MaybePromise<T[]>;

    executeMany(sql: string, paramSets: unknown[]): MaybePromise<number | null>;

    // Tx
    begin(): MaybePromise<void>;

    commit(): MaybePromise<void>;

    rollback(): MaybePromise<void>;
}

// Optional base to reduce boilerplate
export abstract class BaseEngine implements Engine {
    public readonly profile: string;
    public readonly driver: 'mariadb' | 'postgres' | 'sqlite' | 'mysql' | 'mongodb';
    public readonly cfgKey: string;

    protected constructor(args: { profile: string; driver: Engine['driver']; cfgKey: string }) {
        this.profile = args.profile;
        this.driver = args.driver;
        this.cfgKey = args.cfgKey;
    }

    // Public API → protected impl
    async connect() {
        await this._connect();
    }

    async close() {
        await this._close();
    }

    async testConnection() {
        return this._test_connection();
    }

    getConnection() {
        return this._get_connection();
    }

    async execute(sql: string, params?: unknown) {
        return this._execute(sql, params);
    }

    async fetchOne<T>(sql: string, params?: unknown) {
        return this._fetchone<T>(sql, params);
    }

    async fetchAll<T>(sql: string, params?: unknown) {
        return this._fetchall<T>(sql, params);
    }

    async executeMany(sql: string, paramSets: unknown[]) {
        return this._executemany(sql, paramSets);
    }

    async begin() {
        await this._begin();
    }

    async commit() {
        await this._commit();
    }

    async rollback() {
        await this._rollback();
    }

    // ---- subclass hooks ----
    protected abstract _connect(): MaybePromise<void>;

    protected abstract _close(): MaybePromise<void>;

    protected abstract _get_connection(): MaybePromise<unknown>;

    protected abstract _execute(sql: string, params?: unknown): MaybePromise<number | null>;

    protected abstract _fetchone<T = any>(sql: string, params?: unknown): MaybePromise<T | null>;

    protected abstract _fetchall<T = any>(sql: string, params?: unknown): MaybePromise<T[]>;

    protected abstract _executemany(sql: string, paramSets: unknown[]): MaybePromise<number | null>;

    protected abstract _begin(): MaybePromise<void>;

    protected abstract _commit(): MaybePromise<void>;

    protected abstract _rollback(): MaybePromise<void>;

    protected abstract _test_connection(): MaybePromise<boolean>;
}
