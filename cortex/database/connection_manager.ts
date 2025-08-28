// cortex/database/connection_manager.ts
//
// Minimal, robust connection manager.
// - Singleton engine (hot-swaps when settings change)
// - Ensures DB exists (MariaDB/Postgres)
// - Explicit timeouts + pool sizing (env-driven)
// - Supports MariaDB/MySQL, Postgres, SQLite
// - ESM-safe

import { getSettings } from "../settings/get_settings";
import type { Engine } from "./connection";
import { MariaDbEngine } from "./mariadb_engine";
import { PostgresEngine } from "./postgres_engine";
import { SqliteEngine } from "./sqlite_engine";

/* ────────────────────────────────────────────────────────────
 * Types & helpers
 * ──────────────────────────────────────────────────────────── */

type DbSettings = {
    DB_ENGINE?: string;
    DB_HOST?: string;
    DB_PORT?: string | number;
    DB_USER?: string;
    DB_PASS?: string;
    DB_NAME?: string;
    DB_SSL?: string | boolean;

    // optional tuning
    DB_SOCKET?: string;
    DB_POOL_MIN?: string | number;
    DB_POOL_MAX?: string | number;
    DB_CONNECT_TIMEOUT_MS?: string | number;
    DB_ACQUIRE_TIMEOUT_MS?: string | number;
    DB_IDLE_TIMEOUT_MS?: string | number;
};

function toInt(v: unknown, def: number): number {
    const n = typeof v === "string" ? parseInt(v, 10) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n) ? Number(n) : def;
}
function asBool(v: unknown): boolean {
    return v === true || v === "true" || v === "1";
}
function keyFrom(s: DbSettings): string {
    return [
        (s.DB_ENGINE || "").toLowerCase(),
        s.DB_HOST || "",
        String(s.DB_PORT ?? ""),
        s.DB_USER || "",
        s.DB_NAME || s.DB_SOCKET || "",
        String(s.DB_SSL ?? ""),
        String(s.DB_POOL_MIN ?? ""),
        String(s.DB_POOL_MAX ?? ""),
    ].join("|");
}

/* ────────────────────────────────────────────────────────────
 * Global engine singleton
 * ──────────────────────────────────────────────────────────── */

let engineSingleton: Engine | null = null;
let engineKey = "";

/* ────────────────────────────────────────────────────────────
 * Admin: ensure database exists
 * ──────────────────────────────────────────────────────────── */

async function ensureMariaDbDatabaseExists(s: DbSettings): Promise<void> {
    if (!s.DB_NAME) return;

    // Short, direct admin connection (no pool), tiny timeouts for fast fail
    const adminCfg: any = {
        engine: "mariadb",
        host: s.DB_HOST,
        port: Number(s.DB_PORT ?? 3306),
        user: s.DB_USER,
        database: undefined,
        socketPath: s.DB_SOCKET || undefined,
        connectTimeout: toInt(s.DB_CONNECT_TIMEOUT_MS, 3000),
        acquireTimeout: toInt(s.DB_ACQUIRE_TIMEOUT_MS, 3000),
    };
    if (s.DB_PASS != null) adminCfg.password = s.DB_PASS;

    const admin = new MariaDbEngine(adminCfg);
    await (admin as any).connect?.();
    try {
        await admin.execute(`CREATE DATABASE IF NOT EXISTS \`${s.DB_NAME}\``);
    } finally {
        await (admin as any).close?.();
    }
}

async function ensurePostgresDatabaseExists(s: DbSettings): Promise<void> {
    if (!s.DB_NAME) return;

    // Connect to built-in "postgres" DB (short timeouts), then CREATE DATABASE if missing
    const adminCfg: any = {
        engine: "postgres",
        host: s.DB_HOST,
        port: Number(s.DB_PORT ?? 5432),
        user: s.DB_USER,
        password: s.DB_PASS,
        database: "postgres",
        ssl: asBool(s.DB_SSL),
        connectTimeout: toInt(s.DB_CONNECT_TIMEOUT_MS, 3000),
    };

    const admin = new PostgresEngine(adminCfg);
    await (admin as any).connect?.();
    try {
        const { rows } = await admin.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [s.DB_NAME]
        );
        const exists = Array.isArray(rows) && rows.length > 0;
        if (!exists) {
            await admin.execute(`CREATE DATABASE "${s.DB_NAME}"`);
        }
    } finally {
        await (admin as any).close?.();
    }
}

async function ensureTargetDbExists(s: DbSettings): Promise<void> {
    const kind = String(s.DB_ENGINE || "sqlite").toLowerCase();
    if (!s.DB_NAME && kind !== "sqlite") return;

    if (kind === "mariadb" || kind === "mysql") {
        await ensureMariaDbDatabaseExists(s);
        return;
    }
    if (kind === "postgres" || kind === "postgresql" || kind === "pg") {
        await ensurePostgresDatabaseExists(s);
        return;
    }
    // sqlite: file DB auto-creates on connect
}

/* ────────────────────────────────────────────────────────────
 * Builders with sane defaults + pool tuning
 * ──────────────────────────────────────────────────────────── */

function buildEngineFrom(s: DbSettings): Engine {
    const kind = String(s.DB_ENGINE || "sqlite").toLowerCase();

    const poolMin = toInt(s.DB_POOL_MIN, 0);
    const poolMax = toInt(s.DB_POOL_MAX, 10);
    const connectTimeout = toInt(s.DB_CONNECT_TIMEOUT_MS, 3000);
    const acquireTimeout = toInt(s.DB_ACQUIRE_TIMEOUT_MS, 5000);
    const idleTimeout = toInt(s.DB_IDLE_TIMEOUT_MS, 10000);

    if (kind === "mariadb" || kind === "mysql") {
        const cfg: any = {
            engine: "mariadb",
            host: s.DB_HOST,
            port: Number(s.DB_PORT ?? 3306),
            user: s.DB_USER,
            database: s.DB_NAME,        // default schema
            socketPath: s.DB_SOCKET || undefined,
            // tuning
            connectionLimit: poolMax,
            minConnections: poolMin,
            idleTimeout,                 // ms
            acquireTimeout,              // ms
            connectTimeout,              // ms
        };
        if (s.DB_PASS != null) {
            cfg.password = s.DB_PASS;
            cfg.pass = s.DB_PASS;
        }
        return new MariaDbEngine(cfg);
    }

    if (kind === "postgres" || kind === "postgresql" || kind === "pg") {
        const cfg: any = {
            engine: "postgres",
            host: s.DB_HOST,
            port: Number(s.DB_PORT ?? 5432),
            user: s.DB_USER,
            password: s.DB_PASS,
            database: s.DB_NAME,
            ssl: asBool(s.DB_SSL),
            // tuning (supported by most pg pools; harmless if ignored)
            max: poolMax,
            min: poolMin,
            idleTimeoutMillis: idleTimeout,
            statement_timeout: acquireTimeout,
            connectionTimeoutMillis: connectTimeout,
        };
        return new PostgresEngine(cfg);
    }

    // default: sqlite
    const sqliteCfg: any = {
        engine: "sqlite",
        filename: s.DB_NAME || "./database/dev.sqlite",
    };
    return new SqliteEngine(sqliteCfg);
}

/* ────────────────────────────────────────────────────────────
 * Core lifecycle
 * ──────────────────────────────────────────────────────────── */

async function getOrCreateEngine(opts?: { fresh?: boolean }): Promise<Engine> {
    const s = (await getSettings()) as DbSettings;
    const nextKey = keyFrom(s);

    if (opts?.fresh || !engineSingleton || engineKey !== nextKey) {
        await ensureTargetDbExists(s);

        if (engineSingleton && typeof (engineSingleton as any).close === "function") {
            try { await (engineSingleton as any).close(); } catch {}
        }
        engineSingleton = buildEngineFrom(s);
        engineKey = nextKey;
    }

    return engineSingleton!;
}

/* ────────────────────────────────────────────────────────────
 * Public API
 * ──────────────────────────────────────────────────────────── */

export async function withConnection<T>(
    fn: (engine: Engine) => Promise<T> | T,
    opts?: { fresh?: boolean }
): Promise<T> {
    const engine = await getOrCreateEngine(opts);
    if (typeof (engine as any).connect === "function") {
        try {
            await (engine as any).connect();
        } catch (err) {
            // surface a clean hint if pool/host is unreachable
            const s = (await getSettings()) as DbSettings;
            const host = s.DB_SOCKET ? `socket:${s.DB_SOCKET}` : `${s.DB_HOST}:${s.DB_PORT ?? ""}`;
            console.error(`\n✖ Failed to connect to ${s.DB_ENGINE} at ${host}.`);
            console.error(`  • Check server is running, host/port (or DB_SOCKET), user/password, and firewall.`);
            console.error(`  • Current timeouts: connect=${toInt(s.DB_CONNECT_TIMEOUT_MS, 3000)}ms, acquire=${toInt(s.DB_ACQUIRE_TIMEOUT_MS, 5000)}ms`);
            throw err;
        }
    }
    return fn(engine) as any;
}
