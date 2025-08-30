#!/usr/bin/env node
// cortex/cli/index.ts
// Single-file CLI entry (ESM-safe) + optional extension via ./main-cli.{ts,js}
//
// Usage:
//   pnpm cx doctor <boot|apps> [--watch]
//   pnpm cx migrate <fresh|seed|refresh|up|down]
//   pnpm cx                -> runs main() boot sequence

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { migrateAction } from "./doctor/database.js";

// ESM-safe constants
const CWD = process.cwd();
const APPS_DIR = join(CWD, "apps");
const HERE_FILE = fileURLToPath(import.meta.url);
void HERE_FILE;

// Small utils
const log = {
    ok:   (m: string) => console.log(`✅ ${m}`),
    warn: (m: string) => console.warn(`⚠️  ${m}`),
    bad:  (m: string) => console.error(`❌ ${m}`),
    sep:  (t: string) => console.log(`\n—— ${t} ——`),
};
function listApps(): string[] {
    try {
        return readdirSync(APPS_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .sort();
    } catch { return []; }
}
function usage(apps = listApps()) {
    console.log("Codexsun CLI");
    console.log("Usage:");
    console.log("  pnpm cx doctor <boot|apps> [--watch]");
    console.log("  pnpm cx migrate <fresh|seed|refresh|up|down>");
    console.log("  pnpm cx                # run boot sequence");
    console.log("");
    console.log("Apps:", apps.length ? apps.join(", ") : "(none found in /apps)");
}

// Dynamic import helper (handles .ts/.js)
async function tryImport(paths: string[]): Promise<any | null> {
    for (const p of paths) {
        try {
            if (existsSync(p)) return await import(pathToFileURL(p).toString());
        } catch { /* keep trying */ }
    }
    return null;
}

// Optional extension hook
async function tryLoadMainCli(): Promise<null | ((argv: string[]) => Promise<boolean>|boolean)> {
    const mod = await tryImport([
        resolve(CWD, "cortex/cli/main-cli.ts"),
        resolve(CWD, "cortex/cli/main-cli.js"),
    ]);
    if (!mod) return null;
    // Either export default (argv)=>handled or extend({ register(...) })
    if (typeof mod.default === "function") return mod.default;
    if (typeof mod.handle === "function")  return mod.handle;
    return null;
}

/* ------------------------- Doctor subcommands ------------------------- */
async function bootDoctor() {
    const mod = await tryImport([
        resolve(CWD, "cortex/cli/doctor/boot.ts"),
        resolve(CWD, "cortex/cli/doctor/boot.js"),
    ]);
    if (!mod?.bootDoctor) throw new Error("doctor/boot.ts missing export: bootDoctor");
    await mod.bootDoctor();
}
async function appsDoctor() {
    const mod = await tryImport([
        resolve(CWD, "cortex/cli/doctor/boot.ts"),
        resolve(CWD, "cortex/cli/doctor/boot.js"),
    ]);
    if (!mod?.appsDoctor) throw new Error("doctor/boot.ts missing export: appsDoctor");
    await mod.appsDoctor();
}
async function databaseDoctor() {
    const mod = await tryImport([
        resolve(CWD, "cortex/cli/doctor/database.ts"),
        resolve(CWD, "cortex/cli/doctor/database.js"),
    ]);
    if (!mod?.databaseDoctor) throw new Error("doctor/database.ts missing export: databaseDoctor");
    await mod.databaseDoctor();
}
async function migrationDoctor(action?: string) {
    const mod = await tryImport([
        resolve(CWD, "cortex/cli/doctor/database.ts"),
        resolve(CWD, "cortex/cli/doctor/database.js"),
    ]);
    if (!mod?.migrateAction) throw new Error("doctor/database.ts missing export: migrateAction");
    if (action) { await mod.migrateAction(action); return; }
    // no-op default for main() sequence
}
async function apiDoctor() {
    const mod = await tryImport([
        resolve(CWD, "cortex/cli/doctor/restApi.ts"),
        resolve(CWD, "cortex/cli/doctor/restApi.js"),
    ]);
    if (!mod?.apiDoctor) throw new Error("doctor/restApi.ts missing export: apiDoctor");
    await mod.apiDoctor();
}

/* --------------------------- Runner + Tests --------------------------- */
async function migration_runner() {
    // by default call Runner.up(); override via main-cli.ts if needed
    const mod = await tryImport([
        resolve(CWD, "cortex/migration/Runner.ts"),
        resolve(CWD, "cortex/migration/Runner.js"),
        resolve(CWD, "Runner.ts"),
        resolve(CWD, "Runner.js"),
    ]);
    if (mod?.up) {
        log.sep("Migration Runner");
        await mod.up();
        log.ok("migrations: up complete");
    } else {
        log.warn("Runner.up() not found; skipping automatic migration_runner()");
    }
}
async function tests() {
    // stub: wire your test runner here if you want
    // e.g., import a test harness or spawn a script
    // For now we detect a simple test entry and call default() if provided
    const mod = await tryImport([
        resolve(CWD, "cortex/tests/test.ts"),
        resolve(CWD, "cortex/tests/test.js"),
        resolve(CWD, "test.ts"),
        resolve(CWD, "test.js"),
    ]);
    if (mod && typeof mod.default === "function") {
        log.sep("Tests");
        await mod.default();
    } else {
        log.warn("No tests wired; skipping tests()");
    }
}

/* ------------------------------ Routers ------------------------------- */
async function runDoctor(args: string[]) {
    const [sub = ""] = args;
    if (sub === "boot") { await bootDoctor(); return; }
    if (sub === "apps") { await appsDoctor(); return; }
    if (sub === "database") { await databaseDoctor(); return; }
    console.error(`Usage: cx doctor <boot|apps|database>`);
    process.exitCode = 2;
}

async function runMigrate(args: string[]) {
    const [action = ""] = args;
    const allowed = new Set(["fresh", "seed", "refresh", "up", "down"]);
    if (!allowed.has(action)) {
        console.error(`Usage: cx migrate <fresh|seed|refresh|up|down>`);
        process.exitCode = 2;
        return;
    }
    await migrateAction(action as any);
}

/* ------------------------------- main() ------------------------------- */
export async function main(argv = process.argv) {
    const maybeHandle = await tryLoadMainCli();
    if (maybeHandle) {
        const handled = await maybeHandle(argv);
        if (handled) return;
    }

    const [, , cmd = "", ...args] = argv;

    if (!cmd) {
        // Boot sequence
        await bootDoctor();
        // databaseDoctor now warns instead of failing when nothing is configured
        await databaseDoctor();
        await migrationDoctor(); // no-op placeholder
        await apiDoctor();

        // These are optional; they won’t throw if not present
        await migration_runner();
        await tests();
        return; // <— don’t set a failing exit code on success path
    }

    if (cmd === "doctor")  { await runDoctor(args);  return; }
    if (cmd === "migrate") { await runMigrate(args); return; }

    // treat as app name passthrough (optional)
    const apps = listApps();
    if (apps.includes(cmd)) {
        // load apps/<name>/cli(.ts|.js) or cli/index.* or index.*
        const entryCandidates = [
            join(APPS_DIR, cmd, "cli.ts"),
            join(APPS_DIR, cmd, "cli.js"),
            join(APPS_DIR, cmd, "cli", "index.ts"),
            join(APPS_DIR, cmd, "cli", "index.js"),
            join(APPS_DIR, cmd, "index.ts"),
            join(APPS_DIR, cmd, "index.js"),
        ];
        const entry = entryCandidates.find((p) => existsSync(p) && statSync(p).isFile());
        if (!entry) {
            log.bad(`No CLI entry found for app "${cmd}". Tried cli.{ts,js} or cli/index.* or index.*`);
            process.exitCode = 1;
            return;
        }
        const mod = await import(pathToFileURL(entry).toString());
        if (typeof mod.default === "function") { await mod.default(args); return; }
        if (typeof mod.handle  === "function") { await mod.handle(args);  return; }
        log.bad(`No default/handle exported by ${entry}`);
        process.exitCode = 1;
        return;
    }

    log.bad(`Unknown command: "${cmd}"`);
    usage(apps);
    process.exitCode = 2;
}

// run immediately
main().catch((e) => { console.error(e); process.exit(1); });
