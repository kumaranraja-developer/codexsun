#!/usr/bin/env node

/**
 * @file cortex/scripts/test_runner.ts
 * A simple test runner that discovers and runs test files.
 **/

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Load .env if available
(async () => { try { const { config } = await import("dotenv"); config(); } catch {} })().catch(()=>{});

type TestFn = (ctx: { scope: string }) => Promise<void> | void;
type TestCase = { name: string; fn: TestFn; file: string };

type Args = {
    scope: string;
    dir: string[];      // search directories
    pattern: string | null;
    bail: boolean;
    list: boolean;
    verbose: boolean;
};

function parseArgs(argv = process.argv.slice(2)): Args {
    let scope = "default";
    // 👇 include cortex/scripts/tests by default
    const dir: string[] = ["cortex/tests", "tests", "tests"];
    let pattern: string | null = null;
    let bail = false;
    let list = false;
    let verbose = false;

    for (const a of argv) {
        if (a.startsWith("--scope=")) scope = a.split("=", 2)[1] || scope;
        else if (a === "--bail") bail = true;
        else if (a === "--list") list = true;
        else if (a === "--verbose") verbose = true;
        else if (a.startsWith("--pattern=")) pattern = a.split("=", 2)[1] || null;
        else if (a.startsWith("--dir=")) {
            const v = a.split("=", 2)[1];
            if (v) { dir.length = 0; dir.push(...v.split(",").map(s => s.trim()).filter(Boolean)); }
        }
    }

    // Also search apps/*/tests if present
    const appsDir = path.resolve("apps");
    if (existsSync(appsDir)) {
        const apps = readdirSync(appsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
        for (const a of apps) {
            dir.push(`apps/${a}/tests`, `apps/${a}/__tests__`);
        }
    }

    scope = process.env.TEST_SCOPE || scope;
    return { scope, dir, pattern, bail, list, verbose };
}

async function discoverFiles(base: string, acc: string[]) {
    const abs = path.resolve(base);
    if (!existsSync(abs)) return;
    const entries = readdirSync(abs, { withFileTypes: true });
    for (const e of entries) {
        const p = path.join(abs, e.name);
        if (e.isDirectory()) await discoverFiles(p, acc);
        else if (/\.(test|spec)\.(ts|mts|js|mjs)$/i.test(e.name)) acc.push(p);
    }
}

async function loadFromDirs(args: Args): Promise<TestCase[]> {
    const tests: TestCase[] = [];
    const discovered: string[] = [];
    for (const d of args.dir) await discoverFiles(d, discovered);

    for (const fileAbs of discovered) {
        const file = path.relative(process.cwd(), fileAbs);
        const mod = await import(pathToFileURL(fileAbs).href);

        // register(t) pattern
        if (typeof mod.register === "function") {
            await mod.register((name: string, fn: TestFn) => tests.push({ name, fn, file }));
            continue;
        }
        // default export is a registrar
        if (typeof mod.default === "function") {
            await mod.default((name: string, fn: TestFn) => tests.push({ name, fn, file }));
            continue;
        }
        // array `tests`
        if (Array.isArray(mod.tests)) {
            for (const t of mod.tests) tests.push({ ...t, file });
            continue;
        }
        // named exports starting with test
        for (const [k, v] of Object.entries(mod)) {
            if (typeof v === "function" && /^test/i.test(k)) {
                tests.push({ name: `${k} (${path.basename(file)})`, fn: v as TestFn, file });
            }
        }
    }

    return args.pattern
        ? tests.filter(t => t.name.toLowerCase().includes(args.pattern!.toLowerCase()) || t.file.toLowerCase().includes(args.pattern!.toLowerCase()))
        : tests;
}

function hrtimeMs(start: bigint) { return Number(process.hrtime.bigint() - start) / 1e6; }

async function run() {
    const args = parseArgs();
    const tests = await loadFromDirs(args);

    if (tests.length === 0) {
        console.log("No tests found. Place files under cortex/scripts/tests/**/*.test.ts (or scripts/tests, tests).");
        process.exit(0);
    }

    if (args.list) {
        console.log(`Discovered ${tests.length} tests:`);
        for (const t of tests) console.log(` - ${t.name}  [${t.file}]`);
        process.exit(0);
    }

    const ctx = { scope: args.scope };
    let passed = 0, failed = 0;
    console.log(`Running ${tests.length} test(s) with scope="${args.scope}"...\n`);

    for (const t of tests) {
        const start = process.hrtime.bigint();
        try {
            await Promise.resolve(t.fn(ctx));
            console.log(`✅ PASS ${t.name}  (${hrtimeMs(start).toFixed(1)} ms)`);
            if (args.verbose) console.log(`   └─ file: ${t.file}`);
            passed++;
        } catch (err: any) {
            console.error(`❌ FAIL ${t.name}  (${hrtimeMs(start).toFixed(1)} ms)`);
            console.error(`   ${err?.stack || err?.message || String(err)}`);
            failed++;
            if (args.bail) break;
        }
    }

    console.log(`\nSummary: ${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
