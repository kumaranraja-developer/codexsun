// cortex/tests/test.ts
// Minimal test entry: just loads .env and runs the cfg tests.
import 'dotenv/config';
import { runAllCfgTests } from './test_cfg_test';
import {smokeMariaDB} from "./test_smoke_mariadb";
import {smokePostgres} from "./test_smoke_postgres";
import {smokeSQLite} from "./test_smoke_sqlite";
import { color, log } from '../utils/logger';
import { Stage } from '../utils/stage';
import {migration_runner} from "./test_migration";

async function main() {
    // await runAllCfgTests();   // validates .env-driven DB configs
    //
    // const s = new Stage('[db_smoke] start');
    // await smokeMariaDB();     // validates MariaDB connection from .env
    // await smokePostgres()     // validates Postgres connection from .env
    // await smokeSQLite()       // validates SQLite connection from .env
    //
    // s.end('all db smokes completed');
    // console.log('\n' + color.green('[db_smoke] all smokes passed ✅'));

    console.log("[test] starting migration run...");
    await migration_runner();   // will print raw SQL from migrations
    console.log('\n' + color.green('[test] migration run finished. ✅'));


}

main().catch((e) => {
    console.error('[test] fatal', e);
    process.exit(1);
});
