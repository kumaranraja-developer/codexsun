export function envTenantToken(tenantId: string): string {
    return String(tenantId || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_');
}

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

/** Looks up <TOKEN>_<KEY> first, then global <KEY>. */
export function getTenantEnv(tenantId: string, key: string): string | undefined {
    const token = envTenantToken(tenantId);
    const tenantKey = `${token}_${key}`;
    return getEnv(tenantKey) ?? getEnv(key);
}
export function getTenantEnvBool(tenantId: string, key: string, fallback?: boolean) {
    const token = envTenantToken(tenantId);
    const tenantKey = `${token}_${key}`;
    const t = getEnvBool(tenantKey);
    return t !== undefined ? t : getEnvBool(key, fallback);
}
export function getTenantEnvInt(tenantId: string, key: string, fallback?: number) {
    const token = envTenantToken(tenantId);
    const tenantKey = `${token}_${key}`;
    const t = getEnvInt(tenantKey);
    return t !== undefined ? t : getEnvInt(key, fallback);
}

export function getTenantPoolSettings(tenantId: string) {
    return {
        min: getTenantEnvInt(tenantId, 'DB_POOL_MIN'),
        max: getTenantEnvInt(tenantId, 'DB_POOL_MAX'),
        idleMillis: getTenantEnvInt(tenantId, 'DB_POOL_IDLE'),
        acquireTimeoutMillis: getTenantEnvInt(tenantId, 'DB_POOL_ACQUIRE'),
    };
}
