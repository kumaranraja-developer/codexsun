// cortex/tests/test_migration.ts
import { runMigrations } from "../migration/Runner";

export async function migrations() {
    return await runMigrations({ print: true });
}
