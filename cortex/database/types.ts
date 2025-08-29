export type DBDriver = 'mariadb' | 'postgres' | 'sqlite';

export interface DBPoolConfig {
    min?: number;
    max?: number;
    idleMillis?: number;
    acquireTimeoutMillis?: number;
}
export interface BaseDBConfig {
    tenantId: string;
    driver: DBDriver;
    ssl?: boolean | 'require';
    pool?: DBPoolConfig;
    cfgKey: string;
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
    file: string;
}
export type DBConfig = NetworkDBConfig | SQLiteDBConfig;

export function makeConfigKey(parts: Record<string, unknown>): string {
    const entries = Object.entries(parts)
        .filter(([, v]) => v !== undefined && v !== '')
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return 'cfg:' + entries.map(([k, v]) => `${k}=${String(v)}`).join('|');
}
