import { Engine } from './Engine';
import { getDbConfig } from './getDbConfig';
import type {DBConfig, DBDriver, NetworkDBConfig, SQLiteDBConfig} from './types';

type Profile = 'default' | 'BLUE' | 'SANDBOX' | (string & {});

const enginesByProfile: Map<string, Engine> = new Map();

import { SQLiteEngine } from './engines/sqlite_engine';
import { PostgresEngine } from './engines/postgres_engine';
import { MariaDBEngine } from './engines/mariadb_engine';

function buildEngine(cfg: DBConfig): Engine {
    switch (cfg.driver) {
        case 'sqlite':
            return new SQLiteEngine(cfg as SQLiteDBConfig);
        case 'postgres':
            return new PostgresEngine(cfg as NetworkDBConfig);
        case 'mariadb':
            return new MariaDBEngine(cfg as NetworkDBConfig);
        default: {
            // Exhaustiveness check – if we ever add a driver and don’t handle it, TS errors here
            const _exhaustive: never = cfg.driver;
            throw new Error(`Unsupported driver: ${_exhaustive as DBDriver}`);
        }
    }
}

/** Ensure an Engine exists for profile (rebuild if cfgKey changed). */
export async function prepareEngine(profile: Profile = 'default'): Promise<Engine> {
    const cfg = getDbConfig(profile);
    const current = enginesByProfile.get(profile);

    if (current && current.cfgKey === cfg.cfgKey) return current;

    // rotate engine if different config
    if (current) {
        try { await current.close(); } catch { /* ignore */ }
        enginesByProfile.delete(profile);
    }

    const engine = buildEngine(cfg);
    await engine.connect();
    enginesByProfile.set(profile, engine);
    return engine;
}

/** Accessors/shortcuts */
export function getEngine(profile: Profile = 'default'): Engine | undefined {
    return enginesByProfile.get(profile);
}

export async function getConnection(profile: Profile = 'default'): Promise<unknown> {
    const eng = (await prepareEngine(profile));
    return eng.getConnection();
}

export async function closeEngine(profile: Profile = 'default'): Promise<void> {
    const eng = enginesByProfile.get(profile);
    if (eng) {
        await eng.close();
        enginesByProfile.delete(profile);
    }
}

/** DB operations (delegate to the underlying engine) */
export async function execute(profile: Profile, sql: string, params?: unknown) {
    const eng = await prepareEngine(profile);
    return eng.execute(sql, params);
}
export async function fetchOne<T = any>(profile: Profile, sql: string, params?: unknown) {
    const eng = await prepareEngine(profile);
    return eng.fetchOne<T>(sql, params);
}
export async function fetchAll<T = any>(profile: Profile, sql: string, params?: unknown) {
    const eng = await prepareEngine(profile);
    return eng.fetchAll<T>(sql, params);
}
export async function executeMany(profile: Profile, sql: string, paramSets: unknown[]) {
    const eng = await prepareEngine(profile);
    return eng.executeMany(sql, paramSets);
}

export async function begin(profile: Profile)  { const eng = await prepareEngine(profile); return eng.begin(); }
export async function commit(profile: Profile) { const eng = await prepareEngine(profile); return eng.commit(); }
export async function rollback(profile: Profile){ const eng = await prepareEngine(profile); return eng.rollback(); }

export async function healthz(profile: Profile = 'default'): Promise<boolean> {
    const eng = await prepareEngine(profile);
    return eng.testConnection();
}
