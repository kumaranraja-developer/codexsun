import type { DBConfig, DBDriver } from './types';
import { makeConfigKey } from './types';
import {
    getGlobalEnv,
    getPrefixedEnv,
    getEnvBool,
    getPoolSettings,
} from '../settings/get_settings';

/**
 * Profile-based config:
 *   - profile 'default' → read global DB_* keys
 *   - profile 'BLUE'    → read BLUE_DB_* keys
 *   - profile 'SANDBOX' → read SANDBOX_DB_* keys
 */
export function getDbConfig(profileRaw?: string): DBConfig {
    const profile = (profileRaw || 'default').trim();
    const isDefault = profile.toLowerCase() === 'default';
    const read = (key: string) =>
        isDefault ? getGlobalEnv(key) : getPrefixedEnv(profile, key);

    const driver = ((read('DRIVER') || 'mariadb') as DBDriver);

    if (driver === 'sqlite') {
        const file =
            read('FILE') ||
            // fallback to global DB_FILE if profile value missing
            getGlobalEnv('FILE') ||
            `./data/${profile.toLowerCase()}.sqlite`;
        const ssl = toBool(read('SSL'));
        const pool = getPoolSettings(isDefault ? undefined : profile);

        const cfgKey = makeConfigKey({ profile, driver, file, ssl, ...pool });

        return { profile, driver, file, ssl, pool, cfgKey };
    }

    // Network drivers
    const host = required('DB_HOST', read('HOST'), { profile, driver });
    const port = toInt(read('PORT')) ?? defaultPort(driver);
    const user = required('DB_USER', read('USER'), { profile, driver });
    // Support both PASS and PASSWORD (global uses DB_PASS in your sample)
    const password = required('DB_PASSWORD|DB_PASS', read('PASSWORD') ?? read('PASS'), {
        profile,
        driver,
    });
    const database = required('DB_NAME', read('NAME'), { profile, driver });
    const socketPath = read('SOCKET_PATH');
    const ssl = toBool(read('SSL'));
    const pool = getPoolSettings(isDefault ? undefined : profile);

    const cfgKey = makeConfigKey({
        profile,
        driver,
        host,
        port,
        user,
        database,
        ssl,
        socketPath,
        ...pool,
    });

    return {
        profile,
        driver,
        host,
        port,
        user,
        password,
        database,
        socketPath,
        ssl,
        pool,
        cfgKey,
    };
}

function defaultPort(driver: DBDriver): number {
    switch (driver) {
        case 'postgres': return 5432;
        case 'mariadb':  return 3306;
        case 'mysql':  return 3306;
        case 'mongodb':  return 3306;
        case 'sqlite':   return 0;
    }
}

function required(name: string, val: string | undefined, ctx: Record<string, unknown>): string {
    if (val == null || val === '') {
        const ctxPairs = Object.entries(ctx)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => `${k}=${v}`)
            .join(' ');
        throw new Error(`Missing required env: ${name}${ctxPairs ? ` (${ctxPairs})` : ''}`);
    }
    return val;
}

function toInt(raw?: string): number | undefined {
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
}

function toBool(raw?: string): boolean | undefined {
    if (raw == null) return undefined;
    const v = raw.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'off'].includes(v)) return false;
    return undefined;
}

export default getDbConfig;
