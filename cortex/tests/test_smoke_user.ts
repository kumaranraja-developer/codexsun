import { execSync } from "child_process";
import { getConnection } from "../database/connection_manager";
import { ServerLogger } from "../utils/server-logger";

type UserRecord = {
    id?: number;
    name: string;
    email: string;
    password: string;
    tenant_id: number;
    meta: object;
    is_active: number;
    created_at: Date;
    updated_at: Date;
};

type DBConn = {
    query: (sql: string, params?: any[]) => Promise<any>;
    disconnect?: () => Promise<void>;
};

function printStep(step: number, description: string, logger: ServerLogger) {
    logger.info(`[Step ${step}] ${description}`);
}

export async function runUserSmokeTest(profile: string) {
    const logger = new ServerLogger("user-smoke");

    // 🔄 Reset DB schema
    logger.info("Resetting DB schema with `pnpm cx migrate fresh` ...");
    try {
        execSync("pnpm cx migrate fresh", { stdio: "inherit" });
        logger.info("✅ Migration complete");
    } catch (err: any) {
        logger.error("❌ Migration failed, aborting test");
        return;
    }

    const conn = (await getConnection(profile)) as DBConn;
    logger.info("=== User Smoke Test Started ===");

    let step = 1;
    let userId: number | undefined;

    try {
        // 1. Insert user
        printStep(step++, "Insert user into DB", logger);
        const user: UserRecord = {
            name: "SmokeUser1",
            email: "smoke1@example.com",
            password: "secret123",
            tenant_id: 1,
            meta: { smoke: true },
            is_active: 1,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const inserted = await conn.query(
            `INSERT INTO users (name,email,password,tenant_id,meta,is_active,created_at,updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                 RETURNING id`,
            [
                user.name,
                user.email,
                user.password,
                user.tenant_id,
                JSON.stringify(user.meta),
                user.is_active,
                user.created_at,
                user.updated_at,
            ]
        );
        userId = inserted[0]?.id;
        logger.info(`  ✅ Inserted user id=${userId}`);

        // 2. Read user
        printStep(step++, "Read user from DB", logger);
        const read = await conn.query("SELECT * FROM users WHERE id=$1", [userId]);
        logger.info(`  ✅ Read user: ${JSON.stringify(read[0])}`);

        // 3. Update user
        printStep(step++, "Update user in DB", logger);
        await conn.query("UPDATE users SET name=$1, updated_at=$2 WHERE id=$3", [
            "UpdatedSmokeUser1",
            new Date(),
            userId,
        ]);
        logger.info("  ✅ Updated user");

        // 4. Delete user
        printStep(step++, "Delete user from DB", logger);
        await conn.query("DELETE FROM users WHERE id=$1", [userId]);
        logger.info("  ✅ Deleted user");

        logger.info("🎉 Smoke test completed successfully");
    } catch (err: any) {
        logger.error(`❌ Smoke test failed: ${err.message}`);
    } finally {
        await conn.disconnect?.();
        logger.info("=== User Smoke Test Finished ===");
    }
}
