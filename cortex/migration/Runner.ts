// cortex/migration/Runner.ts
import { runMigrations } from "./migration_runner";

async function fresh()   { await runMigrations({ action: "fresh",   profile: process.env.DB_PROFILE ?? "default" }); }
async function refresh() { await runMigrations({ action: "refresh", profile: process.env.DB_PROFILE ?? "default" }); }
async function up()      { await runMigrations({ action: "up",      profile: process.env.DB_PROFILE ?? "default" }); }
async function down()    { await runMigrations({ action: "down",    profile: process.env.DB_PROFILE ?? "default" }); }

export default { fresh, refresh, up, down };
// (You can also export runMigrations for tests to import directly if you want)
export { runMigrations };
