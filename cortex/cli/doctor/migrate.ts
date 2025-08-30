// cortex/cli/doctor/migrate.ts

import "dotenv/config"; // 👈 ensure .env loads for CLI runs

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type RunnerLike = {
    fresh?: (...a: any[]) => any;
    refresh?: (...a: any[]) => any;
    up?: (...a: any[]) => any;
    down?: (...a: any[]) => any;
};

function exitWith(msg: string, code = 1): never { console.error(msg); process.exit(code); }
function info(msg: string) { console.log(msg); }
function ok(msg: string)   { console.log(`✅ ${msg}`); }
function fail(msg: string): never { return exitWith(`❌ ${msg}`); }

const repoRoot = process.cwd();
const resolveFromRoot = (...p: string[]) => path.resolve(repoRoot, ...p);

async function dynImport(file: string) {
    try { return await import(pathToFileURL(file).href); }
    catch (e: any) { return { __import_error: e }; }
}
function isRunnerLike(v: any): v is RunnerLike {
    if (!v) return false; return ["fresh","refresh","up","down"].some(k => typeof v[k] === "function");
}
function isCtor(v: any): v is new (...a: any[]) => any {
    try { return typeof v === "function" && v.prototype && Object.getOwnPropertyNames(v.prototype).length > 1; }
    catch { return false; }
}

async function loadRunnerInstance(): Promise<RunnerLike> {
    const candidates = [
        resolveFromRoot("cortex/migration/Runner.ts"),
        resolveFromRoot("cortex/migration/Runner.js"),
    ];
    const runnerPath = candidates.find((f) => fs.existsSync(f));
    if (!runnerPath) fail("Runner not found at cortex/migration/Runner.{ts,js}");

    const mod = await dynImport(runnerPath);
    if ((mod as any).__import_error) fail(`Failed to import Runner: ${(mod as any).__import_error?.message}`);

    if (mod?.default && isRunnerLike(mod.default)) { ok("Using default object export from Runner"); return mod.default; }
    if (mod?.default && isCtor(mod.default))       { ok("Using default class export from Runner");  return new (mod.default as any)(); }

    for (const name of ["Runner","MigrationRunner"]) {
        if (mod?.[name] && isCtor(mod[name])) { ok(`Using named class export ${name} from Runner`); return new (mod[name] as any)(); }
    }
    for (const name of ["createRunner","makeRunner","getRunner"]) {
        if (typeof mod?.[name] === "function") {
            const inst = mod[name](); if (isRunnerLike(inst)) { ok(`Using factory export ${name}()`); return inst; }
        }
    }
    for (const name of ["runner","migration","migrations"]) {
        if (isRunnerLike(mod?.[name])) { ok(`Using named object export ${name}`); return mod[name]; }
    }
    console.error("Debug: Runner keys:", Object.keys(mod)); fail("Runner export not found.");
}

function parseArgs(argv: string[]) {
    // supports: cx migrate fresh --profile=BLUE
    const flags: Record<string, string | boolean> = {};
    const args: string[] = [];
    for (const a of argv) {
        if (a.startsWith("--")) {
            const [k, v] = a.slice(2).split("=");
            flags[k] = v ?? true;
        } else {
            args.push(a);
        }
    }
    return { args, flags };
}

async function runMigrate(action: string, flags: Record<string, any>) {
    // pass profile through via environment variable that Runner.ts reads
    if (flags.profile) process.env.DB_PROFILE = String(flags.profile);

    const runner = await loadRunnerInstance();
    const valid: (keyof RunnerLike)[] = ["fresh", "refresh", "up", "down"];
    if (!valid.includes(action as any) || typeof (runner as any)[action] !== "function") {
        fail(`Unknown migrate action "${action}". Use one of: ${valid.join(", ")}`);
    }

    info(`—— Migration: ${action} ——`);
    try {
        const result = await (runner as any)[action]();
        if (typeof result !== "undefined") console.log(result);
        ok("Done");
    } catch (e: any) {
        fail(`Migration failed: ${e?.stack || e?.message || e}`);
    }
}

(async function main() {
    const [, , ...rest] = process.argv;
    const { args, flags } = parseArgs(rest);
    const [cmd, subcmd] = args;

    if (!cmd) {
        return exitWith(
            [
                "Usage:",
                "  cx migrate fresh [--profile=NAME]",
                "  cx migrate refresh [--profile=NAME]",
                "  cx migrate up [--profile=NAME]",
                "  cx migrate down [--profile=NAME]",
            ].join("\n")
        );
    }

    switch (cmd) {
        case "migrate":
            if (!subcmd) fail("Missing migrate action (fresh | refresh | up | down)");
            await runMigrate(subcmd, flags);
            break;
        default:
            fail(`Unknown command "${cmd}". Try: migrate`);
    }
})();
