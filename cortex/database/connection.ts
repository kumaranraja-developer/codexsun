// root/cortex/database/connection.ts

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EngineKind = "sqlite" | "mariadb" | "postgres";
export type EngineMode = "readwrite" | "readonly" | "admin" | (string & {}); // pass-through

export type DbConfig = {
    engine: EngineKind;
    mode?: EngineMode;
    host?: string;   // not used for sqlite
    port?: number;   // not used for sqlite
    user?: string;   // not used for sqlite
    pass?: string;   // not used for sqlite
    name?: string;   // db name, or sqlite filename
};

// ─────────────────────────────────────────────────────────────────────────────
// Engine interface + concrete engines
// ─────────────────────────────────────────────────────────────────────────────

// We only type against what we need here.
// Your local ./Engine should be compatible with this.
export interface Engine {
    connect?(): Promise<void> | void;
    close?(): Promise<void> | void;
    // … other methods (query, health, etc.) are defined elsewhere
}

// Concrete engines
import { SqliteEngine } from "./sqlite_engine";
import { MariaDbEngine } from "./mariadb_engine";
// Postgres may not exist yet; provide a lightweight adapter if missing.
let PostgresEngineImpl: undefined | (new (cfg: DbConfig) => Engine);
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    PostgresEngineImpl = require("./postgres_engine").PostgresEngine;
} catch {
    PostgresEngineImpl = undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────────────────────────────────────

let defaultEngine: Engine | null = null;
const namedEngines = new Map<string, Engine>();

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function toKind(v: any): EngineKind {
    const s = String(v ?? "").trim().toLowerCase();
    if (s === "mariadb") return "mariadb";
    if (s === "postgres" || s === "postgresql") return "postgres";
    if (s === "sqlite") return "sqlite";
    // default to sqlite for dev-friendliness
    return "sqlite";
}

function int(v: any, def: number | undefined): number | undefined {
    if (v === undefined || v === null || v === "") return def;
    const n = Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : def;
}

function normalizeConfig(base: Partial<DbConfig>): DbConfig {
    const engine = toKind(base.engine ?? process.env.DB_ENGINE);
    const defaults: Record<EngineKind, Partial<DbConfig>> = {
        sqlite: { name: "./database/dev.sqlite" },
        mariadb: { host: "localhost", port: 3306, user: "root", pass: "", name: "app_db" },
        postgres: { host: "localhost", port: 5432, user: "postgres", pass: "", name: "app_db" },
    };

    const d = defaults[engine];
    return {
        engine,
        mode: (base.mode ?? process.env.DB_MODE) as EngineMode | undefined,
        host: base.host ?? (engine !== "sqlite" ? (process.env.DB_HOST ?? d.host) : undefined),
        port:
            base.port ??
            (engine !== "sqlite"
                ? int(process.env.DB_PORT, d.port as number | undefined)
                : undefined),
        user: base.user ?? (engine !== "sqlite" ? (process.env.DB_USER ?? d.user) : undefined),
        pass: base.pass ?? (engine !== "sqlite" ? (process.env.DB_PASS ?? d.pass) : undefined),
        name:
            base.name ??
            (engine === "sqlite"
                ? (process.env.DB_NAME ?? (d.name as string | undefined))
                : (process.env.DB_NAME ?? (d.name as string | undefined))),
    };
}

function normalizeConfigFromPieces(pieces: Partial<DbConfig>): DbConfig {
    // like normalizeConfig, but do NOT look at base env keys for missing fields here.
    // Use only what’s provided in `pieces` (already assembled by resolvers).
    const engine = toKind(pieces.engine);
    const withDefaults: DbConfig = {
        engine,
        mode: pieces.mode,
        host: pieces.host,
        port:
            pieces.port ??
            (engine === "mariadb" ? 3306 : engine === "postgres" ? 5432 : undefined),
        user: pieces.user,
        pass: pieces.pass,
        name:
            pieces.name ??
            (engine === "sqlite" ? "./database/dev.sqlite" : "app_db"),
    };
    return withDefaults;
}

function bestEffortClose(e: Engine | null) {
    if (!e) return;
    try {
        const p = e.close?.();
        if (p && typeof (p as Promise<void>).then === "function") {
            (p as Promise<void>).catch(() => void 0);
        }
    } catch {
        /* ignore */
    }
}

function upperSnake(s: string): string {
    return s.trim().replace(/[\s\-]+/g, "_").replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase().replace(/^_+/, "");
}

function lowerSnake(s: string): string {
    return s.trim().replace(/[\s\-]+/g, "_").replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`).replace(/^_+/, "").toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine factory (pure, no Settings reads)
// ─────────────────────────────────────────────────────────────────────────────

export function makeEngine(config: DbConfig): Engine {
    const cfg = normalizeConfigFromPieces(config);

    switch (cfg.engine) {
        case "sqlite":
            return new SqliteEngine(cfg);
        case "mariadb":
            return new MariaDbEngine(cfg);
        case "postgres":
            if (!PostgresEngineImpl) {
                throw new Error("Postgres engine not available: ./postgres_engine missing");
            }
            return new PostgresEngineImpl(cfg);
        default:
            throw new Error(`Unsupported engine: ${(cfg as any).engine}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Default (global) engine — lazy singleton, sourced from .env via process.env
// ─────────────────────────────────────────────────────────────────────────────

function resolveDefaultFromEnv(): DbConfig {
    // Reads base keys only (DB_ENGINE, DB_HOST, ...)
    return normalizeConfig({});
}

export function getDefaultEngine(): Engine {
    if (defaultEngine) return defaultEngine;
    const cfg = resolveDefaultFromEnv();
    defaultEngine = makeEngine(cfg);
    return defaultEngine;
}

export async function dropDefaultEngine(): Promise<void> {
    bestEffortClose(defaultEngine);
    defaultEngine = null;
}

export async function reloadDefaultEngine(): Promise<Engine> {
    await dropDefaultEngine();
    return getDefaultEngine();
}

// Programmatic “hot-swap” for the default engine. Also syncs base env keys.
export async function hotSwapDefault(partial: Partial<DbConfig>): Promise<Engine> {
    // Update base env keys with provided fields only.
    if (partial.engine) process.env.DB_ENGINE = String(partial.engine);
    if (partial.mode) process.env.DB_MODE = String(partial.mode);
    if (partial.host !== undefined) process.env.DB_HOST = String(partial.host);
    if (partial.port !== undefined) process.env.DB_PORT = String(partial.port);
    if (partial.user !== undefined) process.env.DB_USER = String(partial.user);
    if (partial.pass !== undefined) process.env.DB_PASS = String(partial.pass);
    if (partial.name !== undefined) process.env.DB_NAME = String(partial.name);

    await dropDefaultEngine();
    return getDefaultEngine();
}

// ─────────────────────────────────────────────────────────────────────────────
// Named engines — prefix env (DEV_DB_HOST …) first, then lower-snake extras.
// Missing pieces may fall back to base keys for resilience.
// ─────────────────────────────────────────────────────────────────────────────

type NamedPieces = Partial<DbConfig>;

function resolveNamedFromPrefixedEnv(name: string): NamedPieces {
    const P = upperSnake(name); // e.g., "DEV", "ANALYTICS"
    const out: NamedPieces = {};
    const read = (k: string) => process.env[k];

    const engine = read(`${P}_DB_ENGINE`);
    const mode = read(`${P}_DB_MODE`);
    const host = read(`${P}_DB_HOST`);
    const port = read(`${P}_DB_PORT`);
    const user = read(`${P}_DB_USER`);
    const pass = read(`${P}_DB_PASS`);
    const dbn  = read(`${P}_DB_NAME`);

    if (engine) out.engine = toKind(engine);
    if (mode) out.mode = mode as EngineMode;
    if (host) out.host = host;
    if (port) out.port = int(port, undefined);
    if (user) out.user = user;
    if (pass) out.pass = pass;
    if (dbn)  out.name = dbn;

    return out;
}

function resolveNamedFromLowerSnakeEnv(name: string): NamedPieces {
    // read extras from process.env that mimic Settings extras (dev_db_engine, …)
    const p = lowerSnake(name); // e.g., "dev", "analytics"
    const read = (k: string) => process.env[k];

    const engine = read(`${p}_db_engine`);
    const mode   = read(`${p}_db_mode`);
    const host   = read(`${p}_db_host`);
    const port   = read(`${p}_db_port`);
    const user   = read(`${p}_db_user`);
    const pass   = read(`${p}_db_pass`);
    const dbn    = read(`${p}_db_name`);

    const out: NamedPieces = {};
    if (engine) out.engine = toKind(engine);
    if (mode) out.mode = mode as EngineMode;
    if (host) out.host = host;
    if (port) out.port = int(port, undefined);
    if (user) out.user = user;
    if (pass) out.pass = pass;
    if (dbn)  out.name = dbn;

    return out;
}

function mergePieces(a: NamedPieces, b: NamedPieces, c: NamedPieces): NamedPieces {
    // precedence: a (prefixed) > b (lower-snake) > c (fallback)
    return {
        engine: a.engine ?? b.engine ?? c.engine,
        mode:   a.mode   ?? b.mode   ?? c.mode,
        host:   a.host   ?? b.host   ?? c.host,
        port:   a.port   ?? b.port   ?? c.port,
        user:   a.user   ?? b.user   ?? c.user,
        pass:   a.pass   ?? b.pass   ?? c.pass,
        name:   a.name   ?? b.name   ?? c.name,
    };
}

function fallbackFromBaseEnv(): NamedPieces {
    // Use base DB_* keys as a last resort to fill gaps
    return {
        engine: toKind(process.env.DB_ENGINE),
        mode:   process.env.DB_MODE as EngineMode | undefined,
        host:   process.env.DB_HOST,
        port:   int(process.env.DB_PORT, undefined),
        user:   process.env.DB_USER,
        pass:   process.env.DB_PASS,
        name:   process.env.DB_NAME,
    };
}

export function getNamedEngine(name: string): Engine {
    const key = name.trim();
    const cached = namedEngines.get(key);
    if (cached) return cached;

    const prefixed = resolveNamedFromPrefixedEnv(key);
    const lower    = resolveNamedFromLowerSnakeEnv(key);
    const base     = fallbackFromBaseEnv();

    const pieces   = mergePieces(prefixed, lower, base);
    const cfg      = normalizeConfigFromPieces(pieces);

    const engine   = makeEngine(cfg);
    namedEngines.set(key, engine);
    return engine;
}

// Update env for that name and rebuild the instance
export async function hotSwapNamed(name: string, partial: Partial<DbConfig>): Promise<Engine> {
    const P = upperSnake(name);

    if (partial.engine) process.env[`${P}_DB_ENGINE`] = String(partial.engine);
    if (partial.mode)   process.env[`${P}_DB_MODE`]   = String(partial.mode);
    if (partial.host !== undefined) process.env[`${P}_DB_HOST`] = String(partial.host);
    if (partial.port !== undefined) process.env[`${P}_DB_PORT`] = String(partial.port);
    if (partial.user !== undefined) process.env[`${P}_DB_USER`] = String(partial.user);
    if (partial.pass !== undefined) process.env[`${P}_DB_PASS`] = String(partial.pass);
    if (partial.name !== undefined) process.env[`${P}_DB_NAME`] = String(partial.name);

    const existing = namedEngines.get(name);
    if (existing) {
        bestEffortClose(existing);
        namedEngines.delete(name);
    }
    return getNamedEngine(name);
}

// Optional helpers
export function dropNamed(name: string): void {
    const e = namedEngines.get(name);
    bestEffortClose(e ?? null);
    namedEngines.delete(name);
}

export function hasNamed(name: string): boolean {
    return namedEngines.has(name);
}
