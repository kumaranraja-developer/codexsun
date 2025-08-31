// Simple env helpers (no tenants logic)

export function getEnv(name: string): string | undefined {
    return process.env[name];
}

export function getEnvBool(name: string, fallback?: boolean): boolean | undefined {
    const raw = getEnv(name);
    if (raw == null) return fallback;
    const v = raw.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'off'].includes(v)) return false;
    return fallback;
}

export function getEnvInt(name: string, fallback?: number): number | undefined {
    const raw = getEnv(name);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
}

/** Read PREFIX_DB_KEY (e.g., BLUE_DB_HOST). Case-insensitive prefix. */
export function getPrefixedEnv(prefix: string, key: string): string | undefined {
    const P = String(prefix || '').trim().toUpperCase();
    return getEnv(`${P}_DB_${key}`);
}

/** Read global DB_KEY (e.g., DB_HOST). */
export function getGlobalEnv(key: string): string | undefined {
    return getEnv(`DB_${key}`);
}

export function getPoolSettings(prefix?: string) {
    const read = prefix ? (k: string) => getPrefixedEnv(prefix, k) : (k: string) => getGlobalEnv(k);
    return {
        min: toInt(read('POOL_MIN')),
        max: toInt(read('POOL_MAX')),
        idleMillis: toInt(read('POOL_IDLE')),
        acquireTimeoutMillis: toInt(read('POOL_ACQUIRE')),
    };

    function toInt(raw?: string): number | undefined {
        if (!raw) return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
    }
}
