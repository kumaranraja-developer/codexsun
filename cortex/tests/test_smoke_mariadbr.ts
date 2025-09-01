// cortex/tests/test_smoke_user.ts
import {getConnection} from "../database/connection_manager";

/** Generic connection interface our test will use */
type Conn = {
    execute: (sql: string, params?: any[]) => Promise<{ rows?: any[] } | any>;
    fetchOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
    fetchAll: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
    executeMany: (sql: string, paramSets: any[][]) => Promise<void>;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    healthz: () => Promise<any>;
    end?: () => Promise<void>;
};

// ===================== Defaults (tune for speed tests) ======================
const NUMBER_OF_TEST_TO_RUNS = 10;
const BULK_USERS_PER_TEST = 50;   // legacy single-batch default
const DEFAULT_SINGLE_INSERTS = 10;  // how many single INSERTs per iteration
const DEFAULT_UPDATES = 20;        // how many rows to UPDATE per iteration
// ===========================================================================

/** Pretty step headers */
function printStep(step: number | string, message: string) {
    console.log(`\n=== ${step}. ${message} ===`);
}

/** Simple CLI arg parser: --key=value */
function parseArgs(argv: string[]) {
    const entries = argv
        .filter((s) => s.startsWith("--"))
        .map((s) => s.slice(2))
        .map((kv) => {
            const idx = kv.indexOf("=");
            if (idx === -1) return [kv, "true"];
            return [kv.slice(0, idx), kv.slice(idx + 1)];
        });
    return Object.fromEntries(entries as [string, string][]);
}

const ARGS = parseArgs(process.argv);

const ITERATIONS = Number(
    ARGS.iterations ?? ARGS.iters ?? process.env.SMOKE_ITERATIONS ?? NUMBER_OF_TEST_TO_RUNS
);

// Bulk config supports either legacy `--bulk` TOTAL or `--bulk_batches` x `--bulk_size`
const LEGACY_BULK_TOTAL = Number(ARGS.bulk ?? ARGS.count ?? process.env.BULK_USERS ?? BULK_USERS_PER_TEST);
const BULK_BATCHES = Number(ARGS.bulk_batches ?? process.env.BULK_BATCHES ?? 1);
const BULK_SIZE = Number(ARGS.bulk_size ?? process.env.BULK_SIZE ?? (BULK_BATCHES > 1 ? 25 : LEGACY_BULK_TOTAL));
const SINGLE_INSERTS = Number(ARGS.single ?? process.env.SINGLE_INSERTS ?? DEFAULT_SINGLE_INSERTS);
const UPDATE_COUNT = Number(ARGS.updates ?? process.env.UPDATES ?? DEFAULT_UPDATES);

const START_PROFILE = String(ARGS.profile ?? process.env.TEST_DB_PROFILE ?? "default");

/** Local profile holder (keeps connection_manager unchanged) */
let activeProfile = START_PROFILE;

function getActiveProfile() {
    return activeProfile;
}

/** Build a resilient adapter over your connection */
function adaptConnection(raw: any): Conn {
    const has = (k: string) => typeof raw?.[k] === "function";

    const exec = async (sql: string, params?: any[]) => {
        if (has("execute")) return raw.execute(sql, params);
        if (has("query")) return raw.query(sql, params);
        throw new Error("No execute/query available on connection");
    };

    const fetchOne = async <T = any>(sql: string, params?: any[]): Promise<T | null> => {
        if (has("fetchOne")) return raw.fetchOne(sql, params);
        const r = await exec(sql, params);
        const rows = r?.rows ?? r ?? [];
        return rows[0] ?? null;
    };

    const fetchAll = async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
        if (has("fetchAll")) return raw.fetchAll(sql, params);
        const r = await exec(sql, params);
        return (r?.rows ?? r ?? []) as T[];
    };

    const executeMany = async (sql: string, paramSets: any[][]): Promise<void> => {
        if (has("executeMany")) {
            await raw.executeMany(sql, paramSets);
            return;
        }
        for (const params of paramSets) {
            await exec(sql, params);
        }
    };

    const begin = async () => {
        if (has("begin")) return raw.begin();
        await exec("BEGIN");
    };

    const commit = async () => {
        if (has("commit")) return raw.commit();
        await exec("COMMIT");
    };

    const rollback = async () => {
        if (has("rollback")) return raw.rollback();
        await exec("ROLLBACK");
    };

    const healthz = async () => {
        if (has("healthz")) return raw.healthz();
        const r = await exec("SELECT 1 AS ok");
        const rows = r?.rows ?? r ?? [];
        return rows[0] ?? {ok: 1};
    };

    const end = has("end") ? raw.end.bind(raw) : undefined;

    return {execute: exec, fetchOne, fetchAll, executeMany, begin, commit, rollback, healthz, end};
}

/** Per-iteration stats */
type IterationStats = {
    passed: boolean;
    ms: number;
    singleInserted: number;
    bulkInserted: number;
    updated: number;
    deleted: number;
};

async function runSingleIteration(conn: Conn, runIndex: number): Promise<IterationStats> {
    const t0 = Date.now();
    const SUFFIX = `${Date.now()}_${runIndex}`;
    const slug = `test-tenant-${SUFFIX}`;
    const tenantEmail = `tenant-${SUFFIX}@example.com`;

    let singleInserted = 0;
    let bulkInserted = 0;
    let updated = 0;
    let deleted = 0;

    printStep(`${runIndex}.1`, "healthz() → connectivity");
    await conn.healthz();

    printStep(`${runIndex}.2`, "begin() → start tx");
    await conn.begin();

    // Create tenant
    printStep(`${runIndex}.3`, "execute() → insert tenant (RETURNING id)");
    const tRes = await conn.execute(
        `INSERT INTO tenants (slug, name, email, is_active)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [slug, "Test Tenant", tenantEmail, 1]
    );
    const tenantId: number = (tRes?.rows ?? [])[0]?.id;
    if (!tenantId) throw new Error("Failed to insert tenant");

    // Single inserts
    printStep(`${runIndex}.4`, `execute() → insert ${SINGLE_INSERTS} single user(s)`);
    const insertedUserIds: number[] = [];
    for (let i = 0; i < SINGLE_INSERTS; i++) {
        const uEmail = `user${i + 1}-${SUFFIX}@example.com`;
        const uRes = await conn.execute(
            `INSERT INTO users (name, email, password, tenant_id)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [`Single User ${i + 1}`, uEmail, "hashedpassword123", tenantId]
        );
        const uid = (uRes?.rows ?? [])[0]?.id;
        if (!uid) throw new Error("Failed to insert single user");
        insertedUserIds.push(uid);
        singleInserted++;
    }

    // Bulk inserts: BULK_BATCHES x BULK_SIZE
    if (BULK_BATCHES > 0 && BULK_SIZE > 0) {
        printStep(`${runIndex}.5`, `executeMany() → bulk insert ${BULK_BATCHES} x ${BULK_SIZE} users`);
        for (let b = 0; b < BULK_BATCHES; b++) {
            const rows: any[][] = Array.from({length: BULK_SIZE}, (_, i) => [
                `Bulk User ${b + 1}-${i + 1} ${SUFFIX}`,
                `bulk${b + 1}-${i + 1}-${SUFFIX}@example.com`,
                "hashedpassword123",
                tenantId,
            ]);
            await conn.executeMany(
                `INSERT INTO users (name, email, password, tenant_id)
                 VALUES ($1, $2, $3, $4)`,
                rows
            );
            bulkInserted += rows.length;
        }
    }

    // Choose rows to UPDATE (IDs): from the tenant's users (we'll select newest first)
    const toUpdate = Math.min(UPDATE_COUNT, singleInserted + bulkInserted);
    if (toUpdate > 0) {
        printStep(`${runIndex}.6`, `UPDATE → ${toUpdate} user rows (RETURNING id)`);
        const idsRes = await conn.fetchAll<{ id: number }>(
            `SELECT id
             FROM users
             WHERE tenant_id = $1
             ORDER BY id DESC
                 LIMIT $2`,
            [tenantId, toUpdate]
        );
        const ids = idsRes.map((r) => r.id);
        if (ids.length) {
            const updRes = await conn.execute(
                `UPDATE users
                 SET name = name || ' (updated)'
                 WHERE id = ANY ($1) RETURNING id`,
                [ids]
            );
            updated = (updRes?.rows ?? []).length;
        }
    }

    // Read back counts
    printStep(`${runIndex}.7`, "fetchAll() → read all users for tenant");
    const allUsers = await conn.fetchAll<{ id: number }>(
        `SELECT id
         FROM users
         WHERE tenant_id = $1`,
        [tenantId]
    );

    // Commit main work
    printStep(`${runIndex}.8`, "commit() → persist inserts/updates");
    await conn.commit();

    // Rollback demo (should not persist)
    printStep(`${runIndex}.9`, "rollback demo → begin + insert + rollback");
    await conn.begin();
    await conn.execute(
        `INSERT INTO users (name, email, password, tenant_id)
         VALUES ($1, $2, $3, $4)`,
        ["Rollback User", `rollback-${SUFFIX}@example.com`, "hashedpassword123", tenantId]
    );
    await conn.rollback();
    const rolledBack = await conn.fetchOne(
        `SELECT id
         FROM users
         WHERE email = $1`,
        [`rollback-${SUFFIX}@example.com`]
    );
    console.log("rolledBack should be null:", rolledBack);

    // Cleanup with counts
    printStep(`${runIndex}.10`, "cleanup → delete users then tenant (RETURNING ids)");
    const delU = await conn.execute(
        `DELETE
         FROM users
         WHERE tenant_id = $1 RETURNING id`,
        [tenantId]
    );
    deleted = (delU?.rows ?? []).length;

    await conn.execute(`DELETE
                        FROM tenants
                        WHERE id = $1`, [tenantId]);

    const ms = Date.now() - t0;
    console.log(`⏱️ iteration ${runIndex} done in ${ms} ms`);
    return {passed: true, ms, singleInserted, bulkInserted, updated, deleted};
}

async function runSmokeTest() {
    console.log("✅ [INFO][user-smoke] === User Smoke Test Started ===");
    console.log(
        `Profile=${getActiveProfile()} | Iterations=${ITERATIONS} | Single=${SINGLE_INSERTS} | Updates=${UPDATE_COUNT} | Bulk=${BULK_BATCHES} x ${BULK_SIZE}`
    );

    // Acquire connection once for the whole loop (keeps pool/manager hot)
    printStep(0, `getConnection('${getActiveProfile()}')`);
    const rawConn = await getConnection(getActiveProfile());
    const conn = adaptConnection(rawConn);
    console.log("Connection acquired");

    const times: number[] = [];
    let passed = 0;
    let failed = 0;
    let totalSingleInserted = 0;
    let totalBulkInserted = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;

    try {
        for (let i = 1; i <= ITERATIONS; i++) {
            try {
                const res = await runSingleIteration(conn, i);
                times.push(res.ms);
                passed++;
                totalSingleInserted += res.singleInserted;
                totalBulkInserted += res.bulkInserted;
                totalUpdated += res.updated;
                totalDeleted += res.deleted;
            } catch (e: any) {
                failed++;
                console.error(`❌ iteration ${i} failed:`, e?.message || e);
                try {
                    await conn.rollback();
                } catch {
                }
            }
        }
    } finally {
        printStep("END", "close connection (if supported)");
        await conn.end?.();
        console.log("✅ [INFO][user-smoke] === User Smoke Test Finished ===");
    }

    // Speed report
    if (times.length) {
        const sum = times.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / times.length);
        const min = Math.min(...times);
        const max = Math.max(...times);

        console.log(`\n=== Speed Report ===
runs: ${times.length}
avg : ${avg} ms
min : ${min} ms
max : ${max} ms
all : [${times.join(", ")}]
`);
    }

    // Speed report
    let totalTime = 0;
    let avg = 0;
    let min = 0;
    let max = 0;
    if (times.length) {
        totalTime = times.reduce((a, b) => a + b, 0);
        avg = totalTime / times.length;
        min = Math.min(...times);
        max = Math.max(...times);

        console.log(`\n=== Speed Report ===
runs: ${times.length}
avg : ${Math.round(avg)} ms
min : ${min} ms
max : ${max} ms
all : [${times.join(", ")}]
`);
    }

    // Totals report
    console.log("=== Totals Report ==============");
    console.log(`executed : ${ITERATIONS}`);
    console.log(`passed   : ${passed}`);
    console.log(`failed   : ${failed}`);
    console.log(`insert   : ${totalSingleInserted}`);
    console.log(`update   : ${totalUpdated}`);
    console.log(`deleted  : ${totalDeleted}`);
    console.log(`bulk     : ${BULK_BATCHES} x ${BULK_SIZE} (rows=${totalBulkInserted})`);

    // Time summary in seconds
    if (times.length) {
        const toSec = (ms: number) => (ms / 1000).toFixed(2);
        console.log("\n=== Time Summary (seconds) ===================");
        console.log(`total : ${toSec(totalTime)} s`);
        console.log(`avg   : ${toSec(avg)} s/run`);
        console.log(`min   : ${toSec(min)} s`);
        console.log(`max   : ${toSec(max)} s`);
    }
}

/** Exported entry so cortex/tests/test.ts can import and run it */
export async function runUserSmokeTest() {
    await runSmokeTest();
}
