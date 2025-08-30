// cortex/tests/test_migration.ts
import { runMigrations } from "../migration/Runner";

export async function migration_runner() {
    return await runMigrations({ print: true });
}
