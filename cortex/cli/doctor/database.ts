// cortex/cli/doctor/database.ts
// Database health check + migrations (hard-wired Seeder + Runner)

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import net from "node:net";
import { loadEnvAndSettings, parseDatabaseUrl, type ParsedDb } from "./settings.js";

const CWD = process.cwd();

const log = {
    ok:   (m: string) => console.log(`✅ ${m}`),
    warn: (m: string) => console.warn(`⚠️  ${m}`),
    bad:  (m: string) => console.error(`❌ ${m}`),
    sep:  (t: string) => console.log(`\n—— ${t} ——`),
};

/* ----------------------------- type guards ----------------------------- */

function isSqliteDb(info: ParsedDb): info is Extract<ParsedDb, { engine: "sqlite" }> {
    return !!info && (info as any).engine === "sqlite" && typeof (info as any).sqliteFile === "string";
}
function isServerDb(info: ParsedDb): info is Extract<ParsedDb, { engine: string }> {
    return !!info && typeof (info as any).engine === "string" && (info as any).engine !== "sqlite";
}

/* ------------------------------- helpers ------------------------------- */

function tcpCheck(host: string, port: number, timeoutMs = 1500): Promise<{ ok: boolean; detail?: string }> {
    return new Promise((resolve) => {
        try {
            const socket = net.connect({ host, port });
            const done = (ok: boolean, detail?: string) => { try { socket.destroy(); } catch {} resolve({ ok, detail }); };
            socket.setTimeout(timeoutMs);
            socket.on("connect", () => done(true));
            socket.on("timeout", () => done(false, "timeout"));
            socket.on("error", (e: any) => done(false, e?.code || String(e)));
        } catch (e: any) {
            resolve({ ok: false, detail: e?.message || String(e) });
        }
    });
}

/** Try a real SELECT 1 using your connection_manager if available. */
async function tryRealSelect1(): Promise<{ ok: boolean; detail?: string }> {
    const guesses = [
        resolve(CWD, "cortex/database/connection_manager.ts"),
        resolve(CWD, "cortex/database/connection_manager.js"),
        resolve(CWD, "connection_manager.ts"),
        resolve(CWD, "connection_manager.js"),
    ];
    for (const g of guesses) {
        try {
            if (!existsSync(g)) continue;
            const mod = await import(g);
            const cm = mod.default ?? mod;
            const connect = cm.connect ?? mod.connect ?? (cm.getConnection ?? mod.getConnection);
            const query   = cm.query   ?? mod.query;

            // shape A: connect()->conn.query(sql)
            if (typeof connect === "function") {
                const conn = await connect();
                if (conn && typeof (conn as any).query === "function") {
                    await (conn as any).query("SELECT 1");
                    if (typeof (conn as any).close === "function") await (conn as any).close();
                    else if (typeof (conn as any).end === "function") await (conn as any).end();
                    return { ok: true };
                }
            }
            // shape B: query(sql) top-level
            if (typeof query === "function") {
                await query("SELECT 1");
                return { ok: true };
            }
        } catch (e: any) {
            return { ok: false, detail: e?.message || String(e) };
        }
    }
    return { ok: false, detail: "connection_manager not available" };
}

/* -------------------------------- doctor -------------------------------- */

export async function databaseDoctor() {
    log.sep("Database Doctor");
    const settings = await loadEnvAndSettings();
    const info = parseDatabaseUrl(settings);

    if (!info.engine) {
        // settings.ts defaults this to sqlite, but keep guard
        log.warn("No DB config could be inferred; skipping.");
        return;
    }

    if (isSqliteDb(info)) {
        const file = info.sqliteFile.startsWith("/") ? info.sqliteFile : resolve(CWD, info.sqliteFile);
        if (file.includes(":memory:")) { log.ok(`SQLite in-memory configured (${info.sqliteFile})`); return; }
        const dir = dirname(file);
        try { mkdirSync(dir, { recursive: true }); } catch {}
        if (!existsSync(file)) {
            try { writeFileSync(file, ""); log.ok(`SQLite created: ${file}`); }
            catch { log.warn(`Could not create SQLite file: ${file}`); }
        } else {
            log.ok(`SQLite file found: ${file}`);
        }
        return;
    }

    if (isServerDb(info)) {
        const host = info.host;
        const port = info.port;
        if (host && port) {
            const res = await tcpCheck(host, port, 1500);
            if (res.ok) log.ok(`DB reachable (${info.engine}) ${host}:${port}`);
            else log.warn(`DB may be unreachable (${info.engine}) ${host}:${port}${res.detail ? ` — ${res.detail}` : ""}`);
        } else {
            log.warn(`Missing DB host/port for engine=${info.engine}; skipping TCP probe`);
        }

        const real = await tryRealSelect1();
        if (real.ok) log.ok("DB query OK (SELECT 1)");
        else log.warn(`DB query skipped (${real.detail})`);
        return;
    }

    // Fallback (shouldn't hit)
    log.warn("Unknown DB configuration; skipping checks.");
}

/* --------------------------- migrations (hard-wired) --------------------------- */

type AnyFn = () => Promise<void> | void;

function pickFn(r: Record<string, any>, names: string[]): AnyFn | null {
    for (const n of names) {
        const f = r[n];
        if (typeof f === "function") return f as AnyFn;
    }
    return null;
}

async function importRunnerHardwired(): Promise<Record<string, any> | null> {
    const ts = resolve(CWD, "cortex/migration/Runner.ts");
    const js = resolve(CWD, "cortex/migration/Runner.js");
    try {
        if (existsSync(ts)) return await import(ts);
    } catch {}
    try {
        if (existsSync(js)) return await import(js);
    } catch {}
    return null;
}

async function importSeederHardwired(): Promise<Record<string, any> | null> {
    const ts = resolve(CWD, "cortex/migration/Seeder.ts");
    const js = resolve(CWD, "cortex/migration/Seeder.js");
    try {
        if (existsSync(ts)) return await import(ts);
    } catch {}
    try {
        if (existsSync(js)) return await import(js);
    } catch {}
    return null;
}

/** `pnpm cx migrate <fresh|seed|refresh|up|down>` */
export async function migrateAction(action: "fresh" | "seed" | "refresh" | "up" | "down") {
    log.sep(`Migration: ${action}`);

    if (action === "seed") {
        const seeder = await importSeederHardwired();
        if (!seeder) {
            log.bad("Seeder not found at cortex/migration/Seeder.{ts,js}");
            process.exitCode = 1;
            return;
        }
        const s = (seeder.default ?? seeder) as Record<string, any>;
        // Accept common names
        const fn = pickFn(s, ["seed", "runSeed", "up", "run", "default"]);
        if (!fn) {
            log.bad("No seed function exported by cortex/migration/Seeder.* (expected one of: seed, runSeed, up, run, default)");
            process.exitCode = 1;
            return;
        }
        await fn();
        log.ok("seed complete");
        return;
    }

    const runner = await importRunnerHardwired();
    if (!runner) {
        log.bad("Runner not found at cortex/migration/Runner.{ts,js}");
        process.exitCode = 1;
        return;
    }
    const r = (runner.default ?? runner) as Record<string, any>;

    // Prefer a single orchestration entry if present
    const runMigrations = r.runMigrations as ((opts: { action: string; print?: boolean }) => Promise<any>) | undefined;

    if (typeof runMigrations === "function") {
        await runMigrations({ action, print: true });
        log.ok(`migrations: ${action} complete`);
        return;
    }

    // Otherwise, fall back to per-action functions with generous aliases
    const aliases: Record<"fresh" | "refresh" | "up" | "down" | "seed", string[]> = {
        up:      ["up", "migrateUp", "runUp", "migrate", "run"],
        down:    ["down", "migrateDown", "rollback", "revert"],
        fresh:   ["fresh", "reset", "recreate", "dropCreate"],
        refresh: ["refresh", "migrateRefresh", "redo", "reapply"],
        seed:    [],
    };
    const fn = pickFn(r, aliases[action]);
    if (!fn) {
        log.bad(`Runner missing "${action}" (looked for: ${aliases[action].join(", ")})`);
        process.exitCode = 1;
        return;
    }
    await fn();
    log.ok(`migrations: ${action} complete`);
}
