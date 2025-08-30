#!/usr/bin/env tsx
// cortex/cli/index.ts
//
// CLI that loads cortex/migration/Runner.{ts,js} and runs migration actions.
// Supports Runner exported as:
//  - default object:   export default { fresh, refresh, up, down }
//  - default class:    export default class Runner { ... }
//  - named class:      export class Runner { ... }
//  - named object:     export const runner = { ... }
//  - factory fn:       export function createRunner(){ return { fresh, ... } }

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type RunnerLike = {
    fresh?: (...a: any[]) => any;
    refresh?: (...a: any[]) => any;
    up?: (...a: any[]) => any;
    down?: (...a: any[]) => any;
};

function exitWith(msg: string, code = 1): never {
    console.error(msg);
    process.exit(code);
}
function info(msg: string) { console.log(msg); }
function ok(msg: string)   { console.log(`✅ ${msg}`); }
function fail(msg: string): never { return exitWith(`❌ ${msg}`); }

const repoRoot = process.cwd();
const resolveFromRoot = (...p: string[]) => path.resolve(repoRoot, ...p);

async function dynImport(file: string) {
    try {
        return await import(pathToFileURL(file).href);
    } catch (e: any) {
        return { __import_error: e };
    }
}

function isRunnerLike(v: any): v is RunnerLike {
    if (!v) return false;
    return ["fresh", "refresh", "up", "down"].some((k) => typeof v[k] === "function");
}

function isCtor(v: any): v is new (...a: any[]) => any {
    try {
        return typeof v === "function" && v.prototype && Object.getOwnPropertyNames(v.prototype).length > 1;
    } catch { return false; }
}

async function loadRunnerInstance(): Promise<RunnerLike> {
    const candidates = [
        resolveFromRoot("cortex/migration/Runner.ts"),
        resolveFromRoot("cortex/migration/Runner.js"),
    ];
    const runnerPath = candidates.find((f) => fs.existsSync(f));
    if (!runnerPath) fail("Runner not found at cortex/migration/Runner.{ts,js}");

    const mod = await dynImport(runnerPath);
    if ((mod as any).__import_error) {
        const e: any = (mod as any).__import_error;
        fail(`Failed to import Runner module: ${e?.stack || e?.message || e}`);
    }

    // 1) default export: object or class
    if (mod?.default) {
        if (isRunnerLike(mod.default)) {
            ok("Using default object export from Runner");
            return mod.default as RunnerLike;
        }
        if (isCtor(mod.default)) {
            ok("Using default class export from Runner");
            return new (mod.default as any)();
        }
    }

    // 2) named class exports
    const namedClassCandidates = ["Runner", "MigrationRunner"];
    for (const name of namedClassCandidates) {
        if (mod?.[name] && isCtor(mod[name])) {
            ok(`Using named class export ${name} from Runner`);
            return new (mod[name] as any)();
        }
    }

    // 3) factory functions
    const factoryCandidates = ["createRunner", "makeRunner", "getRunner"];
    for (const name of factoryCandidates) {
        if (typeof mod?.[name] === "function") {
            const inst = mod[name]();
            if (isRunnerLike(inst)) {
                ok(`Using factory export ${name}() from Runner`);
                return inst;
            }
        }
    }

    // 4) named object export
    const objectCandidates = ["runner", "migration", "migrations"];
    for (const name of objectCandidates) {
        if (isRunnerLike(mod?.[name])) {
            ok(`Using named object export ${name} from Runner`);
            return mod[name];
        }
    }

    console.error("Debug: Runner module keys:", Object.keys(mod));
    fail("Runner export not found. Expected default/named class, default/named object with fresh/refresh/up/down, or a createRunner() factory.");
}

async function runMigrate(action: string) {
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
    const [, , cmd, subcmd] = process.argv;

    if (!cmd) {
        return exitWith(
            [
                "Usage:",
                "  cx migrate fresh",
                "  cx migrate refresh",
                "  cx migrate up",
                "  cx migrate down",
            ].join("\n")
        );
    }

    switch (cmd) {
        case "migrate":
            if (!subcmd) fail("Missing migrate action (fresh | refresh | up | down)");
            await runMigrate(subcmd);
            break;
        default:
            fail(`Unknown command "${cmd}". Try: migrate`);
    }
})();
