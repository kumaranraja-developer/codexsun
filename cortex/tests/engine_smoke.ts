import {
    prepareEngine,
    execute,
    fetchAll,
    executeMany,
    healthz,
} from '../database/connection_manager';
import { color, log } from '../utils/logger';

const PROFILES = ['default', 'BLUE', 'SANDBOX'] as const;

function fail(msg: string): never { throw new Error(msg); }
function assert(cond: unknown, msg: string): asserts cond { if (!cond) fail(msg); }
function makeTable(): string { return `__smoke_${Date.now()}_${Math.floor(Math.random() * 1e6)}`; }

export async function runEngineSmoke(): Promise<void> {
    log.header('[engine_smoke] Starting');
    console.log(color.bold('Profiles:'), PROFILES.join(', '));

    let failures = 0;

    for (const p of PROFILES) {
        const tbl = makeTable();
        try {
            const eng = await prepareEngine(p);
            console.log(
                `\n${color.cyan('[engine_smoke]')} profile=${p} driver=${eng.driver} cfgKey=${eng.cfgKey}`,
            );
            assert(await healthz(p), 'healthz failed');

            // Dialect-specific SQL + param sets
            const createSql =
                eng.driver === 'sqlite'
                    ? `CREATE TABLE ${tbl} (id INTEGER)`
                    : `CREATE TABLE ${tbl} (id INT)`;

            const insertSql =
                eng.driver === 'postgres'
                    ? `INSERT INTO ${tbl} (id) VALUES ($1)`
                    : eng.driver === 'sqlite'
                        ? `INSERT INTO ${tbl} (id) VALUES (@id)`
                        : `INSERT INTO ${tbl} (id) VALUES (?)`;

            const countSql = `SELECT COUNT(*) AS c FROM ${tbl}`;
            const dropSql  = `DROP TABLE ${tbl}`;

            await execute(p, createSql);

            // Per-driver param shape
            const sets =
                eng.driver === 'postgres'
                    ? [[1], [2], [3]]
                    : eng.driver === 'sqlite'
                        ? [{ id: 1 }, { id: 2 }, { id: 3 }] // named params for better-sqlite3
                        : [[1], [2], [3]];

            const inserted = await executeMany(p, insertSql, sets as any[]);
            assert(inserted === null || inserted === 3, `expected 3 inserts, got ${inserted}`);

            const rows = await fetchAll<{ c: number }>(p, countSql);
            const count = Array.isArray(rows) && rows[0]?.c != null ? Number(rows[0].c) : NaN;
            assert(count === 3, `expected count 3, got ${count}`);

            await execute(p, dropSql).catch(() => { /* ignore */ });

            log.ok(`Passed: ${p}`);
        } catch (e: any) {
            failures++;
            log.error(`Failed: ${p} → ${e?.message || e}`);
            await execute(p, `DROP TABLE ${tbl}`).catch(() => { /* ignore */ });
        }
    }

    if (failures) fail(`[engine_smoke] ${failures} profile(s) failed`);
    console.log('\n' + color.green('[engine_smoke] All profiles passed ✅'));
}
