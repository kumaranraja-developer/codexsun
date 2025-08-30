#!/usr/bin/env tsx
/**
 * cortex/cli/index.ts
 * Thin CLI for Codexsun / Cortex:
 *  - migrate: fresh | refresh | up | down
 *  - doctor: environment & DB wiring checks
 *
 * Run via:
 *   pnpm cx migrate fresh
 *   pnpm cx doctor
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// ---------- Types ----------
type MaybeClass<T = unknown> = new (...args: any[]) => T;

// ---------- Helpers ----------
function exitWith(message: string, code = 1): never {
    console.error(message);
    process.exit(code);
}

function info(message: string) {
    console.log(message);
}

function ok(message: string) {
    console.log(`✅ ${message}`);
}

function warn(message: string) {
    console.warn(`⚠️  ${message}`);
}

function fail(message: string): never {
    exitWith(`❌ ${message}`);
}

function repoRoot(): string {
    return process.cwd();
}

function resolveFromRepo(...segments: string[]): string {
    return path.resolve(repoRoot(), ...segments);
}

async function safeDynamicImport<T = any>(filePath: string): Promise<T | null> {
    try {
        const href = pathToFileURL(filePath).href;
        return (await import(href)) as T;
    } catch (err: any) {
        return null;
    }
}

function pickExport<T = any>(mod: any, ...names: string[]): T | null {
    if (!mod) return null;
    if ("default" in mod && mod.default) return mod.default as T;
    for (const n of names) {
        if (n in mod && mod[n]) return mod[n] as T;
    }
    return null;
}

// ---------- Runner loader ----------
async function loadRunnerClass(): Promise<MaybeClass> {
    const candidates = [
        resolveFromRepo("cortex/migration/Runner.ts"),
        resolveFromRepo("cortex/migration/Runner.js"),
    ];

    const runnerPath = candidates.find((p) => fs.existsSync(p));
    if (!runnerPath) {
        fail("Runner not found at cortex/migration/Runner.{ts,js}");
    }

    const mod = await safeDynamicImport<any>(runnerPath);
    if (!mod) {
        fail(`Failed to import Runner module at ${runnerPath}`);
    }

    const Runner = pickExport<MaybeClass>(mod, "Runner");
    if (!Runner) {
        fail("Runner export not found (expected default export or named export `Runner`).");
    }

    return Runner;
}

// ---------- DB Doctor ----------
async function runDoctor() {
    info("—— Doctor ——");

    // 1) Check Runner presence
    {
        const candidates = ["cortex/migration/Runner.ts", "cortex/migration/Runner.js"];
        const existing = candidates.filter((p) => fs.existsSync(resolveFromRepo(p)));
        if (existing.length === 0) {
            fail("Runner not found at cortex/migration/Runner.{ts,js}");
        }
        ok(`Runner present (${existing.join(", ")})`);

        try {
            const Runner = await loadRunnerClass();
            // superficial construct check (won't execute migrations)
            void new (Runner as any)();
            ok("Runner is importable and constructible");
        } catch (e: any) {
            fail(`Runner import/construct failed: ${e?.message || e}`);
        }
    }

    // 2) Load DB config
    let dbConfig: any = null;
    let engineName = "";
    {
        const cfgPathCandidates = [
            resolveFromRepo("cortex/database/getDbConfig.ts"),
            resolveFromRepo("cortex/database/getDbConfig.js"),
        ];
        const cfgPath = cfgPathCandidates.find((p) => fs.existsSync(p));
        if (!cfgPath) {
            warn("getDbConfig not found; skipping config-based checks.");
        } else {
            const mod = await safeDynamicImport<any>(cfgPath);
            if (!mod) {
                warn("getDbConfig import failed; skipping config-based checks.");
            } else {
                const getter = pickExport<() => any>(mod, "getDbConfig");
                if (!getter) {
                    warn("getDbConfig export not found; skipping config-based checks.");
                } else {
                    try {
                        dbConfig = await getter();
                        engineName = dbConfig?.engine ?? dbConfig?.type ?? "";
                        ok(`DB config loaded (engine: ${engineName || "unknown"})`);

                        // Redact sensitive fields
                        const redacted = { ...dbConfig };
                        if (redacted.pass) redacted.pass = "<redacted>";
                        if (redacted.password) redacted.password = "<redacted>";
                        info("DB Config (sanitized):");
                        console.dir(redacted, { depth: 2 });
                    } catch (e: any) {
                        warn(`getDbConfig threw: ${e?.message || e}`);
                    }
                }
            }
        }
    }

    // 3) Try engine module load + optional ping/connect
    // We’ll try to load per-engine shims. If your repo exports different names,
    // this still passes as long as module imports successfully.
    const engineGuesses =
        (engineName && [engineName]) || ["sqlite", "postgres", "mariadb"];

    const engineModuleByName: Record<string, string[]> = {
        sqlite: [
            "cortex/database/sqlite.ts",
            "cortex/database/sqlite.js",
            "cortex/database/sqlite_engine.ts",
            "cortex/database/sqlite_engine.js",
        ],
        postgres: [
            "cortex/database/postgres.ts",
            "cortex/database/postgres.js",
            "cortex/database/postgres_engine.ts",
            "cortex/database/postgres_engine.js",
        ],
        mariadb: [
            "cortex/database/mariadb.ts",
            "cortex/database/mariadb.js",
            "cortex/database/mariadb_engine.ts",
            "cortex/database/mariadb_engine.js",
        ],
    };

    for (const name of engineGuesses) {
        const candidates = engineModuleByName[name] || [];
        const found = candidates.find((p) => fs.existsSync(resolveFromRepo(p)));
        if (!found) {
            continue; // try next engine name
        }

        info(`Trying engine "${name}" via ${found} …`);
        const mod = await safeDynamicImport<any>(resolveFromRepo(found));
        if (!mod) {
            warn(`Import failed for ${found}`);
            continue;
        }
        ok(`Imported engine module for "${name}"`);

        // Try a very light connectivity probe if available
        const maybeFactory =
            pickExport<any>(mod, "createEngine", "engine", "default") || mod;

        const tryMethods = ["ping", "connect", "test", "healthcheck"];
        const instance =
            typeof maybeFactory === "function" ? maybeFactory(dbConfig) : maybeFactory;

        for (const m of tryMethods) {
            const fn = instance?.[m] ?? mod?.[m];
            if (typeof fn === "function") {
                try {
                    info(`Calling ${m}() …`);
                    const res = await fn.call(instance);
                    ok(`${m}() succeeded${res ? ` → ${JSON.stringify(res)}` : ""}`);
                    break; // one method success is enough for doctor
                } catch (e: any) {
                    warn(`${m}() failed: ${e?.message || e}`);
                }
            }
        }

        // Stop after first engine that loads
        break;
    }

    ok("Doctor completed");
}

// ---------- Migrate ----------
async function runMigrate(action: string) {
    const Runner = await loadRunnerClass();
    const runner = new (Runner as any)();

    const actions: Record<string, keyof typeof runner> = {
        fresh: "fresh",
        refresh: "refresh",
        up: "up",
        down: "down",
    };

    const method = actions[action];
    if (!method || typeof (runner as any)[method] !== "function") {
        const available = Object.keys(actions).join(", ");
        fail(`Unknown migrate action "${action}". Use one of: ${available}`);
    }

    info(`—— Migration: ${action} ——`);
    try {
        const result = await (runner as any)[method]();
        if (typeof result !== "undefined") console.log(result);
        ok("Done");
    } catch (e: any) {
        fail(`Migration failed: ${e?.stack || e?.message || e}`);
    }
}

// ---------- Main ----------
(async function main() {
    const [, , cmd, subcmd] = process.argv;

    if (!cmd) {
        exitWith(
            [
                "Usage:",
                "  cx migrate fresh",
                "  cx migrate refresh",
                "  cx migrate up",
                "  cx migrate down",
                "  cx doctor",
            ].join("\n")
        );
    }

    switch (cmd) {
        case "migrate":
            if (!subcmd) fail("Missing migrate action (fresh | refresh | up | down)");
            await runMigrate(subcmd);
            break;
        case "doctor":
            await runDoctor();
            break;
        default:
            fail(`Unknown command "${cmd}". Try: migrate | doctor`);
    }
})();
