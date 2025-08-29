import { prepareEngine, execute, executeMany, fetchAll } from '../database/connection_manager';
import { color, log } from '../utils/logger';

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

export async function smokePostgres(): Promise<void> {
    log.header('[smoke:postgres]');
    const eng = await prepareEngine(PROFILE);
    if (eng.driver !== 'postgres') {
        throw new Error(`Profile ${PROFILE} is ${eng.driver}, expected postgres`);
    }
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

    try {
        await execute(PROFILE, create);

        const rows = genUsers(TOTAL);
        for (let i = 0; i < rows.length; i += BATCH) {
            const chunk = rows.slice(i, i + BATCH);
            const affected = await executeMany(PROFILE, insert, chunk);
            if (affected !== null && affected !== chunk.length) {
                throw new Error(`Batch affected=${affected}, expected=${chunk.length}`);
            }
        }

        const res = await fetchAll<{ c: number }>(PROFILE, countQ);
        const count = Number(res?.[0]?.c ?? NaN);
        if (count !== TOTAL) throw new Error(`Expected ${TOTAL}, got ${count}`);
        log.ok(`Inserted & verified ${TOTAL} rows in Postgres (${color.gray(tbl)})`);
    } finally {
        await execute(PROFILE, drop).catch(() => {});
    }
}
