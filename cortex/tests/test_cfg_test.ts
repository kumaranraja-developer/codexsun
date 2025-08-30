// ESM-safe, no args needed. Validates three profiles: default, BLUE, SANDBOX.
import { getDbConfig } from '../database/getDbConfig';
import type { DBConfig } from '../database/types';

const PROFILES = ['default', 'BLUE', 'SANDBOX'] as const;

function fail(msg: string): never { throw new Error(msg); }
function assert(cond: unknown, msg: string): asserts cond { if (!cond) fail(msg); }
function assertNonEmpty(v: unknown, name: string) {
    assert(typeof v === 'string' && v.trim().length > 0, `Missing ${name}`);
}
function isNumber(n: unknown): n is number { return typeof n === 'number' && Number.isFinite(n); }

function redact<T extends object>(cfg: T): T {
    const out: any = { ...(cfg as any) };
    if (typeof out.password === 'string') {
        const p = out.password as string;
        out.password = p.length <= 4 ? '*'.repeat(p.length) : p.slice(0, 2) + '***' + p.slice(-2);
    }
    return out as T;
}

function validate(cfg: DBConfig) {
    assert(cfg, 'Config is undefined');
    assert(cfg.driver === 'mariadb' || cfg.driver === 'postgres' || cfg.driver === 'sqlite', 'Invalid driver');

    if (cfg.driver === 'sqlite') {
        assertNonEmpty((cfg as any).file, 'DB_FILE (sqlite)');
        return;
    }
    const n = cfg as any;
    assertNonEmpty(n.host, 'DB_HOST/HOST');
    assert(isNumber(n.port) && n.port > 0, 'DB_PORT must be a positive number');
    assertNonEmpty(n.user, 'DB_USER/USER');
    assertNonEmpty(n.password, 'DB_PASSWORD/PASS');
    assertNonEmpty(n.database, 'DB_NAME/NAME');
}

export async function runAllCfgTests(): Promise<void> {
    console.log('[cfg_test] Validating profiles:', PROFILES.join(', '));
    let failures = 0;

    for (const p of PROFILES) {
        try {
            const cfg = getDbConfig(p);
            console.log(`\n[cfg_test] profile=${p}`);
            console.dir(redact(cfg), { depth: null });
            validate(cfg);
            assertNonEmpty((cfg as any).cfgKey, 'cfgKey');
            assert(String((cfg as any).cfgKey).startsWith('cfg:'), 'cfgKey must start with "cfg:"');
            console.log(`✔ Passed: ${p}`);
        } catch (e: any) {
            failures++;
            console.error(`✖ Failed: ${p} → ${e?.message || e}`);
        }
    }

    if (failures) fail(`[cfg_test] ${failures} profile(s) failed`);
    console.log('\n[cfg_test] All profiles passed ✅');
}
