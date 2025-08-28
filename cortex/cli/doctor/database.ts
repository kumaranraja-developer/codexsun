// cortex/commands/doctor/database.ts
//
// Database Doctor with dual API:
// 1) programmatic: runDoctorDatabase(settings) -> Promise<DoctorResult>
// 2) CLI style (no args): runDoctorDatabase() -> prints + process.exit
//
// Keeps compatibility with boot.ts (programmatic) AND your CLI (no-arg).

type DoctorResult = {
    ok: boolean;
    engine?: string;
    code?: string;
    detail?: string;
};

type MaybeEngine = {
    close?: () => Promise<void>;
    healthCheck?: () => Promise<{ ok: boolean; code?: string; detail?: string }>;
    _test_connection?: () => Promise<boolean>;
    fetchall?: <T = any>(sql: string, params?: unknown) => Promise<T[]>;
};

function pickError(err: any): { code?: string; detail?: string } {
    const code = err?.code ?? err?.errno ?? err?.name ?? err?.sqlState;
    const detail =
        err?.detail ??
        err?.sqlMessage ??
        err?.message ??
        (typeof err === "string" ? err : JSON.stringify(err));
    return { code, detail };
}

async function tryImportConnectionManager(): Promise<any | null> {
    try {
        const mod: any = await import("../../database/connection_manager");
        return mod?.connectionManager ?? mod?.default ?? mod ?? null;
    } catch {
        return null;
    }
}

async function buildEngineFromManager(cm: any, settings: any): Promise<MaybeEngine | null> {
    if (!cm) return null;
    const candidates = [
        "getEngineFromSettings",
        "createEngineFromSettings",
        "buildEngineFromSettings",
        "fromSettings",
        "getEngine",
        "createEngine",
        "buildEngine",
        "makeEngine",
    ];
    for (const name of candidates) {
        const fn = cm?.[name];
        if (typeof fn === "function") {
            return await fn.call(cm, settings);
        }
    }
    return null;
}

async function buildEngineDirectly(settings: any): Promise<MaybeEngine> {
    const engine = String(settings?.DB_ENGINE ?? "").toLowerCase();
    switch (engine) {
        case "mariadb": {
            const mod: any = await import("../../database/mariadb_engine");
            const MariaDbEngine = mod?.MariaDbEngine ?? mod?.default ?? mod;
            if (typeof MariaDbEngine !== "function") {
                throw new Error("MariaDbEngine not found in ../../database/mariadb_engine");
            }
            const cfg = {
                engine: "mariadb",
                host: settings.DB_HOST,
                port: Number(settings.DB_PORT ?? 3306),
                user: settings.DB_USER,
                pass: settings.DB_PASS,
                name: settings.DB_NAME,
            };
            return new MariaDbEngine(cfg);
        }
        case "sqlite": {
            const mod: any = await import("../../database/sqlite_engine").catch(() => null);
            const SqliteEngine = mod?.SqliteEngine ?? mod?.default;
            if (typeof SqliteEngine !== "function") {
                throw new Error("SqliteEngine not available");
            }
            const cfg = { engine: "sqlite", name: settings.DB_NAME };
            return new SqliteEngine(cfg);
        }
        case "postgres":
        case "postgresql": {
            const mod: any = await import("../../database/postgres_engine").catch(() => null);
            const PostgresEngine = mod?.PostgresEngine ?? mod?.default;
            if (typeof PostgresEngine !== "function") {
                throw new Error("PostgresEngine not available");
            }
            const cfg = {
                engine: "postgres",
                host: settings.DB_HOST,
                port: Number(settings.DB_PORT ?? 5432),
                user: settings.DB_USER,
                pass: settings.DB_PASS,
                name: settings.DB_NAME,
                ssl: settings.DB_SSL === "true" ? {} : undefined,
            };
            return new PostgresEngine(cfg);
        }
        default:
            throw new Error(`Unsupported DB_ENGINE: ${settings?.DB_ENGINE}`);
    }
}

async function getEngine(settings: any): Promise<MaybeEngine> {
    const cm = await tryImportConnectionManager();
    const fromManager = await buildEngineFromManager(cm, settings);
    if (fromManager) return fromManager;
    return await buildEngineDirectly(settings);
}

async function tryHealth(engine: MaybeEngine): Promise<DoctorResult> {
    if (typeof engine.healthCheck === "function") {
        try {
            const r = await engine.healthCheck();
            return { ok: !!r?.ok, code: r?.code, detail: r?.detail };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }
    if (typeof engine._test_connection === "function") {
        try {
            const ok = await engine._test_connection();
            return { ok: !!ok };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }
    if (typeof engine.fetchall === "function") {
        try {
            await engine.fetchall("SELECT 1");
            return { ok: true };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }
    return { ok: false, detail: "No supported health method on engine" };
}

function withTimeout<T>(p: Promise<T>, ms: number, label = "database health check"): Promise<T> {
    let t: NodeJS.Timeout;
    const timeout = new Promise<never>((_, rej) => {
        t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([p, timeout]).finally(() => clearTimeout(t!));
}

/** Programmatic API used by boot.ts */
export async function doctorDatabase(settings: any): Promise<DoctorResult> {
    let engine: MaybeEngine | null = null;
    const engineName = settings?.DB_ENGINE ?? "unknown";

    try {
        engine = await getEngine(settings);
        const res = await withTimeout(tryHealth(engine), 6000);
        return { engine: engineName, ...res };
    } catch (e: any) {
        return { ok: false, engine: engineName, ...pickError(e) };
    } finally {
        try { await engine?.close?.(); } catch { /* ignore */ }
    }
}

/**
 * CLI handler: if called without args, it will:
 *  - load settings (no watchers)
 *  - run doctorDatabase
 *  - print result and exit with proper code
 * If a settings object is provided, it behaves like the programmatic API.
 */
export async function runDoctorDatabase(settings?: any): Promise<DoctorResult | void> {
    if (settings) {
        // programmatic usage
        return doctorDatabase(settings);
    }

    // CLI usage (no args)
    const mod: any = await import("../../settings/get_settings");
    let s: any;
    try {
        s = (await (mod.getSettings as any)({ watch: false })) ?? (await mod.getSettings());
    } catch {
        s = await mod.getSettings();
    }

    const res = await doctorDatabase(s);

    if (res.ok) {
        console.log(`✅ Database (engine=${res.engine ?? s?.DB_ENGINE ?? "unknown"})`);
        process.exit(0);
    } else {
        console.error(`❌ Database failed (engine=${res.engine ?? s?.DB_ENGINE ?? "unknown"})`);
        if (res.code) console.error(`   code=${res.code}`);
        if (res.detail) console.error(`   detail=${res.detail}`);
        process.exit(1);
    }
}

// Exports for CLI compatibility
export default runDoctorDatabase;
export { doctorDatabase as databaseDoctor };
