import { prepareEngine, execute, executeMany, fetchAll } from '../database/connection_manager';
import { color, log, step } from '../utils/locger';
import { Stage } from '../utils/stage';
import { Progress } from '../utils/locger';
import { getDbConfig } from "../database/getDbConfig";

const PROFILE = 'BLUE' as const;
const TOTAL = 5000;
const BATCH = 500;

function makeTable() {
    return `users_smoke_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function genUsers(n: number) {
    return Array.from({ length: n }, (_, i) => {
        const id = i + 1;
        return [id, `User ${id}`, `user${id}@test.local`];
    });
}

export async function smokePostgres(profile = "default"): Promise<void> {

    console.log("[smoke:postgres] resolve engine");
    const cfg = getDbConfig(profile);

    // REPLACE any throw on mismatch with:
    if ((cfg?.driver ?? "").toLowerCase() !== "postgres") {
        console.log(`[smoke:postgres] skipped (active driver: ${cfg?.driver ?? "unknown"})`);
        return;
    }


    const s0 = new Stage('[smoke:postgres] resolve engine');
    const eng = await prepareEngine(PROFILE);
    if (eng.driver !== 'postgres') throw new Error(`Profile ${PROFILE} is ${eng.driver}, expected postgres`);
    s0.end(`engine ready driver=${eng.driver} cfgKey=${eng.cfgKey}`);

    const tbl = makeTable();
    const create = `
        CREATE TABLE ${tbl} (
                                id INT PRIMARY KEY,
                                name VARCHAR(100) NOT NULL,
                                email VARCHAR(120) NOT NULL UNIQUE,
                                created_at TIMESTAMPTZ DEFAULT NOW()
        )`;
    const insert = `INSERT INTO ${tbl} (id, name, email) VALUES ($1, $2, $3)`;
    const countQ = `SELECT COUNT(*)::int AS c FROM ${tbl}`;
    const drop = `DROP TABLE ${tbl}`;

    const s1 = new Stage('[smoke:postgres] create table');
    try { await execute(PROFILE, create); s1.end(`table ${color.gray(tbl)} created`); }
    catch (e) { s1.fail(e, `create ${tbl}`); throw e; }

    const s2 = new Stage(`[smoke:postgres] insert ${TOTAL} rows`);
    try {
        const rows = genUsers(TOTAL);


        const prog = new Progress(TOTAL, 'postgres:insert');
        for (let i = 0; i < rows.length; i += BATCH) {
            const chunk = rows.slice(i, i + BATCH);
            const affected = await executeMany(PROFILE, insert, chunk);
            if (affected !== null && affected !== chunk.length) {
                throw new Error(`Batch affected=${affected}, expected=${chunk.length}`);
            }
            step('insert', Math.min(i + BATCH, rows.length), rows.length);
            prog.tick(Math.min(i + BATCH, rows.length));
        }
        s2.end('inserts ok');
        prog.done(rows.length);
    } catch (e) {
        s2.fail(e, 'insert');
        await execute(PROFILE, drop).catch(() => {});
        throw e;
    }

    const s3 = new Stage('[smoke:postgres] verify count');
    try {
        const res = await fetchAll<{ c: number }>(PROFILE, countQ);
        const count = Number(res?.[0]?.c ?? NaN);
        if (count !== TOTAL) throw new Error(`Expected ${TOTAL}, got ${count}`);
        s3.end(`verified ${TOTAL}`);
    } catch (e) {
        s3.fail(e, 'verify');
        await execute(PROFILE, drop).catch(() => {});
        throw e;
    }

    const s4 = new Stage('[smoke:postgres] drop table');
    await execute(PROFILE, drop).then(
        () => s4.end(`dropped ${color.gray(tbl)}`),
        (e) => s4.fail(e, `drop ${tbl}`)
    );

    log.ok(`Postgres smoke passed for ${color.gray(tbl)}`);
}
