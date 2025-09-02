// cortex/tests/test_smoke_user.ts
import { getConnection } from "../database/connection_manager";

/** Generic connection interface our test will use */
type Conn = {
    execute: (sql: string, params?: any[]) => Promise<any>;
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
const NUMBER_OF_TEST_TO_RUNS = 30;
const DEFAULT_SINGLE_INSERTS = 1;   // single INSERTs per iteration
const DEFAULT_UPDATES = 20;         // rows to UPDATE per iteration
const DEFAULT_BULK_BATCHES = 1;     // how many executeMany batches per iter
const DEFAULT_BULK_SIZE = 100;      // rows per batch
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

const BULK_BATCHES = Number(ARGS.bulk_batches ?? process.env.BULK_BATCHES ?? DEFAULT_BULK_BATCHES);
const BULK_SIZE = Number(ARGS.bulk_size ?? process.env.BULK_SIZE ?? DEFAULT_BULK_SIZE);
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
        return rows[0] ?? { ok: 1 };
    };

    const end = has("end") ? raw.end.bind(raw) : undefined;

    return { execute: exec, fetchOne, fetchAll, executeMany, begin, commit, rollback, healthz, end };
}

/** Dialect detection & helpers */
type Dialect = "postgres" | "mysql" | "sqlite"; // sqlite added

async function detectDialect(conn: Conn): Promise<{ dialect: Dialect; version: string }> {
    // 1) Try engines exposing VERSION() (Postgres/MySQL-family)
    try {
        const v1 = await conn.fetchOne<{ version?: string; VERSION?: string }>("SELECT VERSION() AS version");
        const version1 = (v1 as any)?.version ?? (v1 as any)?.VERSION ?? "unknown";
        const lower1 = String(version1).toLowerCase();
        if (lower1.includes("postgres")) return { dialect: "postgres", version: version1 };
        return { dialect: "mysql", version: version1 }; // MySQL or MariaDB both come here
    } catch {}

    // 2) MySQL/MariaDB fallback via @@version and comment
    try {
        const v2 = await conn.fetchOne<{ v?: string; c?: string }>("SELECT @@version AS v, @@version_comment AS c");
        if (v2?.v) {
            const lower2 = String(v2.v).toLowerCase();
            return { dialect: "mysql", version: v2.v + (v2.c ? ` (${v2.c})` : "") };
        }
    } catch {}

    // 3) Try SQLite
    try {
        const v3 = await conn.fetchOne<{ version?: string }>("SELECT sqlite_version() AS version");
        const version3 = (v3 as any)?.version ?? "unknown";
        return { dialect: "sqlite", version: version3 };
    } catch {}

    // 4) Fallback
    return { dialect: "sqlite", version: "unknown" };
}

/** Resolve existing table names to honor current FKs (tenant vs tenants, user vs users) */
async function resolveTables(conn: Conn, dialect: Dialect): Promise<{ tenant: string; users: string }> {
    if (dialect === "postgres") {
        const t = await conn.fetchOne<{ table_name: string }>(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name IN ('tenants','tenant')
             ORDER BY CASE WHEN table_name='tenant' THEN 0 ELSE 1 END
                 LIMIT 1`
        );
        const u = await conn.fetchOne<{ table_name: string }>(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name IN ('users','user')
             ORDER BY CASE WHEN table_name='users' THEN 0 ELSE 1 END
                 LIMIT 1`
        );
        return { tenant: t?.table_name ?? "tenants", users: u?.table_name ?? "users" };
    } else if (dialect === "mysql") {
        const t = await conn.fetchOne<{ table_name: string }>(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = DATABASE() AND table_name IN ('tenant','tenants')
             ORDER BY CASE WHEN table_name='tenant' THEN 0 ELSE 1 END
                 LIMIT 1`
        );
        const u = await conn.fetchOne<{ table_name: string }>(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = DATABASE() AND table_name IN ('users','user')
             ORDER BY CASE WHEN table_name='users' THEN 0 ELSE 1 END
                 LIMIT 1`
        );
        return { tenant: t?.table_name ?? "tenants", users: u?.table_name ?? "users" };
    } else {
        // SQLite
        const t = await conn.fetchOne<{ table_name: string }>(
            `SELECT name AS table_name
             FROM sqlite_master
             WHERE type='table' AND name IN ('tenant','tenants')
             ORDER BY CASE WHEN name='tenant' THEN 0 ELSE 1 END
                 LIMIT 1`
        );
        const u = await conn.fetchOne<{ table_name: string }>(
            `SELECT name AS table_name
             FROM sqlite_master
             WHERE type='table' AND name IN ('users','user')
             ORDER BY CASE WHEN name='users' THEN 0 ELSE 1 END
                 LIMIT 1`
        );
        return { tenant: t?.table_name ?? "tenants", users: u?.table_name ?? "users" };
    }
}

/** Create tables if neither exist (don’t override existing schemas) */
async function ensureSchemaIfMissing(conn: Conn, dialect: Dialect, names: { tenant: string; users: string }) {
    // Probe for tenant table using a non-reserved alias
    if (dialect === "postgres" || dialect === "mysql") {
        const probeSql =
            dialect === "postgres"
                ? `SELECT 1 AS present FROM information_schema.tables WHERE table_schema='public' AND table_name=$1 LIMIT 1`
                : `SELECT 1 AS present FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`;
        const tenantProbe = await conn.fetchOne<{ present: number }>(probeSql, [names.tenant]);
        if (tenantProbe?.present) return;
    } else {
        const probe = await conn.fetchOne<{ present: number }>(
            `SELECT 1 AS present FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1`,
            [names.tenant]
        );
        if (probe?.present) return;
    }

    if (dialect === "postgres") {
        await conn.execute(
            `CREATE TABLE IF NOT EXISTS ${names.tenant} (
                                                            id BIGSERIAL PRIMARY KEY,
                                                            slug TEXT UNIQUE NOT NULL,
                                                            name TEXT NOT NULL,
                                                            email TEXT UNIQUE,
                                                            is_active INTEGER NOT NULL DEFAULT 1,
                                                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ NULL
                )`
        );
        await conn.execute(
            `CREATE TABLE IF NOT EXISTS ${names.users} (
                                                           id BIGSERIAL PRIMARY KEY,
                                                           name TEXT NOT NULL,
                                                           email TEXT UNIQUE,
                                                           password TEXT NOT NULL,
                                                           tenant_id BIGINT NOT NULL REFERENCES ${names.tenant}(id) ON DELETE CASCADE,
                meta JSONB NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ NULL
                )`
        );
    } else if (dialect === "mysql") {
        await conn.execute(
            `CREATE TABLE IF NOT EXISTS ${names.tenant} (
                                                            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                                            slug VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        );
        await conn.execute(
            `CREATE TABLE IF NOT EXISTS ${names.users} (
                                                           id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                                           name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255) NOT NULL,
                tenant_id BIGINT UNSIGNED NOT NULL,
                meta JSON NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL,
                CONSTRAINT fk_users_tenant_id FOREIGN KEY (tenant_id) REFERENCES ${names.tenant}(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        );
    } else {
        // SQLite
        await conn.execute(
            `CREATE TABLE IF NOT EXISTS ${names.tenant} (
                                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            slug TEXT NOT NULL UNIQUE,
                                                            name TEXT NOT NULL,
                                                            email TEXT UNIQUE,
                                                            is_active INTEGER NOT NULL DEFAULT 1,
                                                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                            deleted_at DATETIME NULL
             )`
        );
        await conn.execute(
            `CREATE TABLE IF NOT EXISTS ${names.users} (
                                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                           name TEXT NOT NULL,
                                                           email TEXT UNIQUE,
                                                           password TEXT NOT NULL,
                                                           tenant_id INTEGER NOT NULL,
                                                           meta TEXT NULL,                 -- JSON as TEXT
                                                           is_active INTEGER NOT NULL DEFAULT 1,
                                                           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                           updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                           deleted_at DATETIME NULL,
                                                           FOREIGN KEY (tenant_id) REFERENCES ${names.tenant}(id) ON DELETE CASCADE
                )`
        );
        // Trigger to emulate "ON UPDATE CURRENT_TIMESTAMP"
        await conn.execute(
            `CREATE TRIGGER IF NOT EXISTS trg_${names.users}_updated_at
       AFTER UPDATE ON ${names.users}
       BEGIN
         UPDATE ${names.users}
           SET updated_at = CURRENT_TIMESTAMP
           WHERE id = NEW.id;
       END;`
        );
    }
}

/** Helpers to run INSERT/UPDATE/DELETE in a dialect-safe + table-name-safe way */
async function insertTenant(
    conn: Conn,
    dialect: Dialect,
    names: { tenant: string },
    slug: string,
    name: string,
    email: string,
    active: number
) {
    if (dialect === "postgres") {
        const r = await conn.execute(
            `INSERT INTO ${names.tenant} (slug, name, email, is_active) VALUES ($1, $2, $3, $4) RETURNING id`,
            [slug, name, email, active]
        );
        return (r?.rows ?? [])[0]?.id as number;
    } else {
        const res = await conn.execute(
            `INSERT INTO ${names.tenant} (slug, name, email, is_active) VALUES (?, ?, ?, ?)`,
            [slug, name, email, active]
        );
        const directId = (res && (res.insertId ?? res.lastID ?? res.lastInsertId)) ?? null;
        if (directId != null) return Number(directId);

        const row =
            dialect === "sqlite"
                ? await conn.fetchOne<{ id: number }>(`SELECT last_insert_rowid() AS id`)
                : await conn.fetchOne<{ id: number }>(`SELECT LAST_INSERT_ID() AS id`);
        return row?.id!;
    }
}

async function insertUser(
    conn: Conn,
    dialect: Dialect,
    names: { users: string },
    { name, email, password, tenantId }: { name: string; email: string; password: string; tenantId: number }
) {
    if (dialect === "postgres") {
        const r = await conn.execute(
            `INSERT INTO ${names.users} (name, email, password, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, email, password, tenantId]
        );
        return (r?.rows ?? [])[0]?.id as number;
    } else {
        const res = await conn.execute(
            `INSERT INTO ${names.users} (name, email, password, tenant_id) VALUES (?, ?, ?, ?)`,
            [name, email, password, tenantId]
        );
        const directId = (res && (res.insertId ?? res.lastID ?? res.lastInsertId)) ?? null;
        if (directId != null) return Number(directId);

        const row =
            dialect === "sqlite"
                ? await conn.fetchOne<{ id: number }>(`SELECT last_insert_rowid() AS id`)
                : await conn.fetchOne<{ id: number }>(`SELECT LAST_INSERT_ID() AS id`);
        return row?.id!;
    }
}

async function bulkInsertUsers(
    conn: Conn,
    dialect: Dialect,
    names: { users: string },
    tenantId: number,
    rows: Array<[string, string, string]>
) {
    const params = rows.map(([name, email, password]) => [name, email, password, tenantId]);
    if (dialect === "postgres") {
        await conn.executeMany(
            `INSERT INTO ${names.users} (name, email, password, tenant_id) VALUES ($1, $2, $3, $4)`,
            params
        );
    } else {
        await conn.executeMany(
            `INSERT INTO ${names.users} (name, email, password, tenant_id) VALUES (?, ?, ?, ?)`,
            params
        );
    }
    return rows.length;
}

async function updateUsersByIds(conn: Conn, dialect: Dialect, names: { users: string }, ids: number[]) {
    if (!ids.length) return 0;

    if (dialect === "postgres") {
        const r = await conn.execute(
            `UPDATE ${names.users}
             SET name = name || ' (updated)'
             WHERE id = ANY($1)
                 RETURNING id`,
            [ids]
        );
        return (r?.rows ?? []).length;
    }

    if (dialect === "sqlite") {
        // No RETURNING guarantee -> do an UPDATE then SELECT count
        await conn.execute(
            `UPDATE ${names.users}
             SET name = name || ' (updated)'
             WHERE id IN (${ids.map(() => "?").join(",")})`,
            ids
        );
        const got = await conn.fetchAll<{ id: number }>(
            `SELECT id FROM ${names.users} WHERE id IN (${ids.map(() => "?").join(",")})`,
            ids
        );
        return got.length;
    }

    // MySQL/MariaDB
    const placeholders = ids.map(() => "?").join(",");
    await conn.execute(
        `UPDATE ${names.users} SET name = CONCAT(name, ' (updated)') WHERE id IN (${placeholders})`,
        ids
    );
    const got = await conn.fetchAll<{ id: number }>(
        `SELECT id FROM ${names.users} WHERE id IN (${placeholders})`,
        ids
    );
    return got.length;
}

async function deleteTenantCascade(conn: Conn, dialect: Dialect, names: { tenant: string; users: string }, tenantId: number) {
    await conn.execute(`DELETE FROM ${names.users} WHERE tenant_id = ${dialect === "postgres" ? "$1" : "?"}`, [tenantId]);
    await conn.execute(`DELETE FROM ${names.tenant} WHERE id = ${dialect === "postgres" ? "$1" : "?"}`, [tenantId]);
}

type IterationStats = {
    passed: boolean;
    ms: number;
    singleInserted: number;
    bulkInserted: number;
    updated: number;
    deleted: number;
};

async function runSingleIteration(
    conn: Conn,
    dialect: Dialect,
    names: { tenant: string; users: string },
    runIndex: number
): Promise<IterationStats> {
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

    printStep(`${runIndex}.3`, `insert into ${names.tenant}`);
    const tenantId = await insertTenant(conn, dialect, { tenant: names.tenant }, slug, "Test Tenant", tenantEmail, 1);
    if (!tenantId) throw new Error("Failed to insert tenant");

    printStep(`${runIndex}.4`, `insert ${SINGLE_INSERTS} single user(s) into ${names.users}`);
    for (let i = 0; i < SINGLE_INSERTS; i++) {
        const uid = await insertUser(conn, dialect, { users: names.users }, {
            name: `Single User ${i + 1}`,
            email: `user${i + 1}-${SUFFIX}@example.com`,
            password: "hashedpassword123",
            tenantId,
        });
        if (!uid) throw new Error("Failed to insert single user");
        singleInserted++;
    }

    if (BULK_BATCHES > 0 && BULK_SIZE > 0) {
        printStep(`${runIndex}.5`, `bulk insert ${BULK_BATCHES} x ${BULK_SIZE} into ${names.users}`);
        for (let b = 0; b < BULK_BATCHES; b++) {
            const pack: Array<[string, string, string]> = Array.from({ length: BULK_SIZE }, (_, i) => [
                `Bulk User ${b + 1}-${i + 1} ${SUFFIX}`,
                `bulk${b + 1}-${i + 1}-${SUFFIX}@example.com`,
                "hashedpassword123",
            ]);
            bulkInserted += await bulkInsertUsers(conn, dialect, { users: names.users }, tenantId, pack);
        }
    }

    const toUpdate = Math.min(UPDATE_COUNT, singleInserted + bulkInserted);
    let idsForUpdate: number[] = [];
    if (toUpdate > 0) {
        const sel = await conn.fetchAll<{ id: number }>(
            `SELECT id FROM ${names.users} WHERE tenant_id = ${dialect === "postgres" ? "$1" : "?"}
             ORDER BY id DESC LIMIT ${dialect === "postgres" ? "$2" : "?"}`,
            [tenantId, toUpdate]
        );
        idsForUpdate = sel.map((r) => r.id);
        printStep(`${runIndex}.6`, `update ${idsForUpdate.length} users`);
        updated = await updateUsersByIds(conn, dialect, { users: names.users }, idsForUpdate);
    }

    printStep(`${runIndex}.7`, `count users for tenant in ${names.users}`);
    const allUsers = await conn.fetchAll<{ id: number }>(
        `SELECT id FROM ${names.users} WHERE tenant_id = ${dialect === "postgres" ? "$1" : "?"}`,
        [tenantId]
    );
    console.log("user count:", allUsers.length);

    printStep(`${runIndex}.8`, "commit()");
    await conn.commit();

    printStep(`${runIndex}.9`, "rollback demo");
    await conn.begin();
    await insertUser(conn, dialect, { users: names.users }, {
        name: "Rollback User",
        email: `rollback-${SUFFIX}@example.com`,
        password: "hashedpassword123",
        tenantId,
    });
    await conn.rollback();
    const rolledBack = await conn.fetchOne(
        `SELECT id FROM ${names.users} WHERE email = ${dialect === "postgres" ? "$1" : "?"}`,
        [`rollback-${SUFFIX}@example.com`]
    );
    console.log("rolledBack should be null:", rolledBack);

    printStep(`${runIndex}.10`, "cleanup (users → tenant)");
    const delU = await conn.fetchAll<{ id: number }>(
        `SELECT id FROM ${names.users} WHERE tenant_id = ${dialect === "postgres" ? "$1" : "?"}`,
        [tenantId]
    );
    deleted = delU.length;
    await deleteTenantCascade(conn, dialect, names, tenantId);

    const ms = Date.now() - t0;
    console.log(`⏱️ iteration ${runIndex} done in ${ms} ms`);
    return { passed: true, ms, singleInserted, bulkInserted, updated, deleted };
}

async function runSmokeTest() {
    const rawConn = await getConnection(getActiveProfile());
    const conn = adaptConnection(rawConn);

    // Detect dialect & version, resolve tables, ensure schema (if missing)
    const { dialect, version } = await detectDialect(conn);
    const names = await resolveTables(conn, dialect);
    console.log("✅ [INFO][user-smoke] === User Smoke Test Started ===");
    console.log(
        `Server=${version} (${dialect}) | Profile=${getActiveProfile()} | Iterations=${ITERATIONS} | Single=${SINGLE_INSERTS} | Updates=${DEFAULT_UPDATES} | Bulk=${BULK_BATCHES} x ${BULK_SIZE}`
    );

    await ensureSchemaIfMissing(conn, dialect, names);

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
                const res = await runSingleIteration(conn, dialect, names, i);
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
                } catch {}
            }
        }
    } finally {
        printStep("END", "close connection (if supported)");
        await conn.end?.();
        console.log("✅ [INFO][user-smoke] === User Smoke Test Finished ===");
    }

    // Speed & time summary
    let totalTime = 0,
        avg = 0,
        min = 0,
        max = 0;
    if (times.length) {
        totalTime = times.reduce((a, b) => a + b, 0);
        avg = totalTime / times.length;
        min = Math.min(...times);
        max = Math.max(...times);
    }

    // Totals Report
    console.log("=== Totals Report ==============");
    console.log(`executed : ${ITERATIONS}`);
    console.log(`passed   : ${passed}`);
    console.log(`failed   : ${failed}`);
    console.log(`insert   : ${totalSingleInserted}`);
    console.log(`update   : ${totalUpdated}`);
    console.log(`deleted  : ${totalDeleted}`);
    console.log(`bulk     : ${BULK_BATCHES} x ${BULK_SIZE} (rows=${totalBulkInserted})`);

    // Time Summary (seconds)
    if (times.length) {
        const toSec = (ms: number) => (ms / 1000).toFixed(2);
        console.log("\n=== Time Summary (seconds) ===");
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
