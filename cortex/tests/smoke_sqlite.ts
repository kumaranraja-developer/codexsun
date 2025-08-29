import { prepareEngine, execute, fetchAll } from '../database/connection_manager';
import { color, log } from '../utils/logger';

const PROFILE = 'SANDBOX' as const;
const TOTAL = 1000;      // lighter on SQLite
const BATCH = 500;       // we’ll insert with literal values for zero-binding issues

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

export async function smokeSQLite(): Promise<void> {
    log.header('[smoke:sqlite]');
    const eng = await prepareEngine(PROFILE);
    if (eng.driver !== 'sqlite') {
        throw new Error(`Profile ${PROFILE} is ${eng.driver}, expected sqlite`);
    }
    const tbl = makeTable();
    const create = `CREATE TABLE ${tbl} (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  )`;
    const countQ = `SELECT COUNT(*) AS c FROM ${tbl}`;
    const drop = `DROP TABLE ${tbl}`;

    try {
        await execute(PROFILE, create);

        // Use literal VALUES to avoid any binding ambiguity in better-sqlite3
        const rows = genUsers(TOTAL);
        for (let i = 0; i < rows.length; i += BATCH) {
            const chunk = rows.slice(i, i + BATCH);
            const valuesSql = chunk
                .map(u => `(${u.id}, '${u.name}', '${u.email}')`)
                .join(', ');
            const insert = `INSERT INTO ${tbl} (id, name, email) VALUES ${valuesSql}`;
            await execute(PROFILE, insert);
        }

        const res = await fetchAll<{ c: number }>(PROFILE, countQ);
        const count = Number(res?.[0]?.c ?? NaN);
        if (count !== TOTAL) throw new Error(`Expected ${TOTAL}, got ${count}`);
        log.ok(`Inserted & verified ${TOTAL} rows in SQLite (${color.gray(tbl)})`);
    } finally {
        await execute(PROFILE, drop).catch(() => {});
    }
}
