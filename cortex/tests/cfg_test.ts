// cortex/tests/cfg_test.ts
import { getDbConfig } from '../database/getDbConfig';
import type { DBConfig } from '../database/types';

/** 🔧 Tenants to validate by default */
const DEFAULT_TENANTS: string[] = [
    'tenant_acme_001', // token -> ACME_001
    'blue-shop',       // token -> BLUE_SHOP
    'sandbox',         // token -> SANDBOX
];

/** --- small assert helpers --- */
function fail(msg: string): never {
    throw new Error(msg);
}
function assert(cond: unknown, msg: string): asserts cond {
    if (!cond) fail(msg);
}
function assertNonEmpty(v: unknown, name: string) {
    assert(typeof v === 'string' && v.trim().length > 0, `Missing ${name}`);
}
function isNumber(n: unknown): n is number {
    return typeof n === 'number' && Number.isFinite(n);
}

/** redact only the `password` field if it exists and is a string */
function redact<T extends object>(cfg: T): T {
    // copy into a shallow mutable object without requiring index signatures
    const out: any = { ...(cfg as any) };
    if (typeof out.password === 'string') {
        const p = out.password as string;
        out.password = p.length <= 4 ? '*'.repeat(p.length) : p.slice(0, 2) + '***' + p.slice(-2);
    }
    return out as T;
}

/** Per-driver validation */
function validateConfig(cfg: DBConfig) {
    assert(cfg, 'Config is undefined');
    assert(cfg.driver === 'mariadb' || cfg.driver === 'postgres' || cfg.driver === 'sqlite', 'Invalid driver');

    if (cfg.driver === 'sqlite') {
        // SQLiteDBConfig
        assertNonEmpty((cfg as any).file, 'DB_FILE (sqlite)');
        return;
    }

    // NetworkDBConfig
    const n = cfg as Extract<DBConfig, { host: string }>;
    assertNonEmpty(n.host, 'DB_HOST');
    assert(isNumber(n.port) && n.port > 0, 'DB_PORT must be a positive number');
    assertNonEmpty(n.user, 'DB_USER');
    assertNonEmpty((n as any).password, 'DB_PASSWORD');
    assertNonEmpty(n.database, 'DB_NAME');
}

/** Run tests for all tenants (defaults inside this file) */
export async function runAllCfgTests(): Promise<void> {
    const tenants = DEFAULT_TENANTS;

    console.log('[cfg_test] Running DB config checks for:', tenants.join(', '));
    let failures = 0;

    for (const t of tenants) {
        try {
            const cfg = getDbConfig(t);
            console.log(`\n[cfg_test] tenant=${t}`);
            console.dir(redact(cfg), { depth: null });
            validateConfig(cfg);
            // basic cfgKey sanity
            assertNonEmpty((cfg as any).cfgKey, 'cfgKey');
            assert(String((cfg as any).cfgKey).startsWith('cfg:'), 'cfgKey must start with "cfg:"');
            console.log(`✔ Passed: ${t}`);
        } catch (e: any) {
            failures++;
            console.error(`✖ Failed: ${t} → ${e?.message || e}`);
        }
    }

    if (failures > 0) fail(`[cfg_test] ${failures} tenant(s) failed config validation`);
    console.log('\n[cfg_test] All tenants passed ✅');
}
