// cortex/tests/test.ts
// Minimal test entry: just loads .env and runs the cfg tests.
import 'dotenv/config';
import { runAllCfgTests } from './test_cfg_test';
import {smokeMariaDB} from "./test_smoke_mariadb";
import {smokePostgres} from "./test_smoke_postgres";
import {smokeSQLite} from "./test_smoke_sqlite";
// import {migrations} from "./test_migration";
import {migration_runner} from "./test_migration_runner";

async function main() {

    await runAllCfgTests();   // validates .env-driven DB configs
    await smokeMariaDB();     // validates MariaDB connection from .env
    await smokePostgres()     // validates Postgres connection from .env
    await smokeSQLite()       // validates SQLite connection from .env
    // await migrations();   // will print raw SQL from migrations
    // await migration_runner();   // will print raw SQL from migrations


}

main().catch((e) => {
    console.error('[test] fatal', e);
    process.exit(1);
});
