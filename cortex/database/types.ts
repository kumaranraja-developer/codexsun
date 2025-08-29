export type DBDriver = 'mariadb' | 'postgres' | 'sqlite';

export interface DBPoolConfig {
    min?: number;
    max?: number;
    idleMillis?: number;
    acquireTimeoutMillis?: number;
}

export interface BaseDBConfig {
    profile: string;        // 'default' | 'BLUE' | 'SANDBOX' | etc.
    driver: DBDriver;
    ssl?: boolean | 'require';
    pool?: DBPoolConfig;
    cfgKey: string;         // stable cache key
}

export interface NetworkDBConfig extends BaseDBConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    socketPath?: string;
}

export interface SQLiteDBConfig extends BaseDBConfig {
    file: string;           // path to sqlite file
}

export type DBConfig = NetworkDBConfig | SQLiteDBConfig;

/** Build a deterministic key from config parts. */
export function makeConfigKey(parts: Record<string, unknown>): string {
    const entries = Object.entries(parts)
        .filter(([, v]) => v !== undefined && v !== '')
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return 'cfg:' + entries.map(([k, v]) => `${k}=${String(v)}`).join('|');
}
