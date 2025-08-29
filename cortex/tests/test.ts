// cortex/tests/test.ts
// Minimal test entry: just loads .env and runs the cfg tests.
import 'dotenv/config';
import { runAllCfgTests } from './cfg_test';
import {smokeMariaDB} from "./smoke_mariadb";
import {smokePostgres} from "./smoke_postgres";
import {smokeSQLite} from "./smoke_sqlite";
import { color, log } from '../utils/logger';
import { Stage } from '../utils/stage';

async function main() {
    await runAllCfgTests();   // validates .env-driven DB configs

    const s = new Stage('[db_smoke] start');
    await smokeMariaDB();     // validates MariaDB connection from .env
    await smokePostgres()     // validates Postgres connection from .env
    await smokeSQLite()       // validates SQLite connection from .env

    s.end('all db smokes completed');
    console.log('\n' + color.green('[db_smoke] all smokes passed ✅'));
}

main().catch((e) => {
    console.error('[test] fatal', e);
    process.exit(1);
});
