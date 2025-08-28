// cortex/scripts/test_runner.ts

// ------------------------------------------------------------
// Minimal test harness + runner (no dependencies)
// ------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// ---------------------- Env bootstrap (optional) ----------------------
async function loadEnv() {
    try {
        const { config } = await import("dotenvx"); // optional
        // mimic the logs you saw previously and override existing env
        config({ override: true });
    } catch {
        // dotenvx not installed; that's fine
    }
}

// ---------------------- Types ----------------------
type TestFn = () => unknown | Promise<unknown>;
type HookFn = () => unknown | Promise<unknown>;

interface TestCase {
    name: string;
    fn: TestFn;
    file: string;
}

interface Suite {
    name: string;
    file: string;
    tests: TestCase[];
    beforeAll: HookFn[];
    afterAll: HookFn[];
}

interface RunnerOptions {
    match?: string;
    timeoutMs: number;
    bail: boolean;
    scope: string;
}

// ---------------------- Global registry ----------------------
const suites: Suite[] = [];
let currentSuite: Suite | null = null;

function ensureSuite(file: string) {
    if (!currentSuite || currentSuite.file !== file) {
        currentSuite = {
            name: path.basename(file),
            file,
            tests: [],
            beforeAll: [],
            afterAll: [],
        };
        suites.push(currentSuite);
    }
    return currentSuite;
}

// Expose BDD-style globals that test files can call
(globalThis as any).describe = (name: string, fn: () => void) => {
    // use current file suite; name is cosmetic here
    currentSuite!.name = name || currentSuite!.name;
    fn();
};

(globalThis as any).test = (name: string, fn: TestFn) => {
    if (!currentSuite) throw new Error("No active suite. Did you call `test` at top-level?");
    currentSuite.tests.push({ name, fn, file: currentSuite.file });
};

(globalThis as any).beforeAll = (fn: HookFn) => {
    if (!currentSuite) throw new Error("No active suite for beforeAll.");
    currentSuite.beforeAll.push(fn);
};

(globalThis as any).afterAll = (fn: HookFn) => {
    if (!currentSuite) throw new Error("No active suite for afterAll.");
    currentSuite.afterAll.push(fn);
};

// Optional tiny `expect` (use your own assertions if you prefer)
(globalThis as any).expect = (received: any) => ({
    toBe: (expected: any) => {
        if (received !== expected) throw new Error(`Expected ${received} to be ${expected}`);
    },
    toBeTruthy: () => {
        if (!received) throw new Error(`Expected value to be truthy, got ${received}`);
    },
    toEqual: (expected: any) => {
        const r = JSON.stringify(received);
        const e = JSON.stringify(expected);
        if (r !== e) throw new Error(`Expected ${r} to equal ${e}`);
    },
});

// ---------------------- Utility helpers ----------------------
function hrtime() {
    const start = process.hrtime.bigint();
    return () => {
        const ns = Number(process.hrtime.bigint() - start);
        return ns / 1_000_000; // ms
    };
}

function* walk(dir: string): Generator<string> {
    const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
    for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) yield* walk(fp);
        else yield fp;
    }
}

function looksLikeTestFile(fp: string) {
    const b = path.basename(fp);
    return (
        /\.test\.(t|j)sx?$/.test(b) // *.test.ts, *.test.tsx, *.test.js, *.test.jsx
    );
}

function filterByMatch(cases: TestCase[], match?: string) {
    if (!match) return cases;
    const s = match.toLowerCase();
    return cases.filter((t) => t.name.toLowerCase().includes(s) || t.file.toLowerCase().includes(s));
}

async function importTestFile(filePath: string) {
    ensureSuite(filePath);
    // Import as file:// URL for ESM loaders (tsx)
    const fileUrl = url.pathToFileURL(filePath).href;
    await import(fileUrl);
}

// ---------------------- Core runner ----------------------
async function runSuite(suite: Suite, opt: RunnerOptions) {
    // run hooks
    for (const hook of suite.beforeAll) {
        await hook();
    }

    const cases = filterByMatch(suite.tests, opt.match);
    let passed = 0;
    let failed = 0;

    for (const t of cases) {
        const stop = hrtime();
        try {
            await runWithTimeout(t.fn, opt.timeoutMs);
            console.log(`✅ PASS ${suiteName(suite)}: ${t.name}  (${stop().toFixed(1)} ms)`);
            passed++;
        } catch (err: any) {
            console.error(`❌ FAIL ${suiteName(suite)}: ${t.name}`);
            if (err && err.stack) console.error(err.stack);
            else console.error(err);
            failed++;
            if (opt.bail) break;
        }
    }

    // run teardown
    for (const hook of suite.afterAll) {
        try {
            await hook();
        } catch (e) {
            console.warn(`[warn] afterAll threw in ${suiteName(suite)}:`, e);
        }
    }

    return { passed, failed, total: cases.length };
}

function suiteName(s: Suite) {
    return s.name || path.basename(s.file);
}

async function runWithTimeout(fn: TestFn, timeoutMs: number) {
    let t: NodeJS.Timeout;
    await Promise.race([
        Promise.resolve().then(fn),
        new Promise((_, reject) => {
            t = setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs} ms`)), timeoutMs);
        }),
    ]).finally(() => {
        clearTimeout(t!);
    });
}

// ---------------------- CLI args ----------------------
function parseArgs(argv: string[]): RunnerOptions & { roots: string[] } {
    const opt: RunnerOptions = { timeoutMs: 10_000, bail: false, scope: "default" };
    const roots: string[] = [];
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--match") opt.match = argv[++i];
        else if (a === "--timeout") opt.timeoutMs = parseInt(argv[++i], 10) || opt.timeoutMs;
        else if (a === "--bail") opt.bail = true;
        else if (a === "--scope") opt.scope = argv[++i] ?? opt.scope;
        else if (a === "--root") roots.push(argv[++i]); // add more search roots
    }
    if (roots.length === 0) {
        // sensible defaults
        roots.push(path.join(process.cwd(), "cortex"));
        roots.push(path.join(process.cwd(), "apps"));
    }
    return { ...opt, roots };
}

// ---------------------- main() + default export ----------------------
async function main(argv: string[] = []) {
    await loadEnv();

    const { roots, ...opt } = parseArgs(argv);

    // Discover test files
    const candidates = new Set<string>();
    for (const root of roots) {
        for (const fp of walk(root)) {
            if (looksLikeTestFile(fp)) candidates.add(fp);
        }
    }
    const files = Array.from(candidates).sort();

    console.log(`Running ${files.length} test file(s) with scope="${opt.scope}"...`);

    // Import files (register tests)
    for (const f of files) {
        currentSuite = null;
        await importTestFile(f);
    }

    // Run suites
    let total = 0;
    let passed = 0;
    let failed = 0;

    for (const s of suites) {
        const r = await runSuite(s, opt);
        total += r.total;
        passed += r.passed;
        failed += r.failed;
        if (opt.bail && r.failed > 0) break;
    }

    // Summary
    const icon = failed === 0 ? "✅" : "❌";
    console.log(`\nSummary: ${icon} ${passed} passed, ${failed} failed, ${total} total\n`);

    if (failed > 0) process.exitCode = 1;
}

// ESM-safe "run directly" guard
const thisFile = url.fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invoked === thisFile) {
    void main(process.argv.slice(2));
}

// ---- CLI adapter expected by cortex/main.ts
export default async function run(args: string[]) {
    await main(args);
}

// ------------------------------------------------------------
// END
// ------------------------------------------------------------
