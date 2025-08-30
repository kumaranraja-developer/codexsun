import { prepareEngine, execute, fetchAll } from '../database/connection_manager';
import { color, log, step } from '../utils/logger';
import { Stage } from '../utils/stage';
import { Progress } from '../utils/logger';
import { getDbConfig } from "../database/getDbConfig";

const PROFILE = 'SANDBOX' as const;
const TOTAL = 1000;
const BATCH = 500;

function makeTable() {
    return `users_smoke_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function genUsers(n: number) {
    return Array.from({ length: n }, (_, i) => {
        const id = i + 1;
        const name = `User ${id}`.replace(/'/g, "''");
        const email = `user${id}@test.local`;
        return { id, name, email };
    });
}

export async function smokeSQLite(profile = "default"): Promise<void> {

    console.log("[smoke:sqlite] resolve engine");
    const cfg = getDbConfig(profile);

    // If someone runs it while another driver is active, just skip
    if ((cfg?.driver ?? "").toLowerCase() !== "sqlite") {
        console.log(`[smoke:sqlite] skipped (active driver: ${cfg?.driver ?? "unknown"})`);
        return;
    }


    const s0 = new Stage('[smoke:sqlite] resolve engine');
    const eng = await prepareEngine(PROFILE);
    if (eng.driver !== 'sqlite') throw new Error(`Profile ${PROFILE} is ${eng.driver}, expected sqlite`);
    s0.end(`engine ready driver=${eng.driver} cfgKey=${eng.cfgKey}`);

    const tbl = makeTable();
    const create = `CREATE TABLE ${tbl} (
                                            id INTEGER PRIMARY KEY,
                                            name TEXT NOT NULL,
                                            email TEXT NOT NULL UNIQUE,
                                            created_at TEXT DEFAULT (datetime('now'))
                    )`;
    const countQ = `SELECT COUNT(*) AS c FROM ${tbl}`;
    const drop = `DROP TABLE ${tbl}`;

    const s1 = new Stage('[smoke:sqlite] create table');
    try { await execute(PROFILE, create); s1.end(`table ${color.gray(tbl)} created`); }
    catch (e) { s1.fail(e, `create ${tbl}`); throw e; }

    const s2 = new Stage(`[smoke:sqlite] insert ${TOTAL} rows`);
    try {
        const rows = genUsers(TOTAL);
        const prog = new Progress(TOTAL, 'sqlite:insert');

        for (let i = 0; i < rows.length; i += BATCH) {
            const chunk = rows.slice(i, i + BATCH);
            const valuesSql = chunk.map(u => `(${u.id}, '${u.name}', '${u.email}')`).join(', ');
            const insert = `INSERT INTO ${tbl} (id, name, email) VALUES ${valuesSql}`;
            await execute(PROFILE, insert);
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

    const s3 = new Stage('[smoke:sqlite] verify count');
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

    const s4 = new Stage('[smoke:sqlite] drop table');
    await execute(PROFILE, drop).then(
        () => s4.end(`dropped ${color.gray(tbl)}`),
        (e) => s4.fail(e, `drop ${tbl}`)
    );

    log.ok(`SQLite smoke passed for ${color.gray(tbl)}`);
}
