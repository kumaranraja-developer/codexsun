import type { DBConfig, DBDriver } from './types';
import { makeConfigKey } from './types';
import {
    getTenantEnv,
    getTenantEnvInt,
    getTenantEnvBool,
    getTenantPoolSettings,
    envTenantToken,
} from '../settings/get_settings';

function required(name: string, value: string | undefined, ctx: Record<string, unknown>) {
    if (value == null || value === '') {
        const ctxPairs = Object.entries(ctx)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => `${k}=${v}`)
            .join(' ');
        throw new Error(`Missing required env: ${name}${ctxPairs ? ` (${ctxPairs})` : ''}`);
    }
    return value;
}

function defaultPortFor(driver: DBDriver): number {
    switch (driver) {
        case 'postgres':
            return 5432;
        case 'mariadb':
            return 3306;
        case 'sqlite':
            return 0;
    }
}

export function getDbConfig(tenantIdRaw: string): DBConfig {
    const tenantId = tenantIdRaw?.trim();
    if (!tenantId) throw new Error('getDbConfig requires a non-empty tenantId');

    const driver = (getTenantEnv(tenantId, 'DB_DRIVER') || 'mariadb') as DBDriver;

    if (driver === 'sqlite') {
        const file =
            getTenantEnv(tenantId, 'DB_FILE') ||
            `./data/${envTenantToken(tenantId).toLowerCase()}.sqlite`;
        const ssl = getTenantEnvBool(tenantId, 'DB_SSL');
        const pool = getTenantPoolSettings(tenantId);
        const cfgKey = makeConfigKey({ tenantId, driver, file, ssl, ...pool });
        return { tenantId, driver, file, ssl, pool, cfgKey };
    }

    const host = required('DB_HOST', getTenantEnv(tenantId, 'DB_HOST'), { tenantId, driver });
    const port = getTenantEnvInt(tenantId, 'DB_PORT', defaultPortFor(driver))!;
    const user = required('DB_USER', getTenantEnv(tenantId, 'DB_USER'), { tenantId, driver });
    const password = required('DB_PASSWORD', getTenantEnv(tenantId, 'DB_PASSWORD'), {
        tenantId,
        driver,
    });
    const database = required('DB_NAME', getTenantEnv(tenantId, 'DB_NAME'), { tenantId, driver });
    const socketPath = getTenantEnv(tenantId, 'DB_SOCKET_PATH');
    const ssl = getTenantEnvBool(tenantId, 'DB_SSL');
    const pool = getTenantPoolSettings(tenantId);

    const cfgKey = makeConfigKey({
        tenantId,
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
        tenantId,
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

export default getDbConfig;
