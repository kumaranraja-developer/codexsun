#!/usr/bin/env node

// Keep your framework exports:
export { createServer } from "./server/create";
export { discoverApps } from "./apps/discover";
export type { AppMountInfo } from "./server/mount";

/**
 * Minimal CLI router for codexsun.
 * Usage:
 *   pnpm cx migrate --app cxsun
 *   pnpm cx migrate --all
 *   pnpm cx test
 *   pnpm cx <command> [args...]
 */

type CommandHandler = (args: string[]) => Promise<void> | void;

function resolveHandler(mod: unknown): CommandHandler {
    const m = mod as any;
    if (typeof m === "function") return m as CommandHandler;
    if (m && typeof m.default === "function") return m.default as CommandHandler;
    if (m && typeof m.run === "function") return m.run as CommandHandler;
    throw new TypeError(
        "Loaded command module does not export a handler (default/run/function)."
    );
}

const registry: Record<string, () => Promise<unknown>> = {
    migrate:   () => import("./migration/runner"),
    rollback:  () => import("./migration/rollback"),
    fresh:     () => import("./migration/fresh"),

    test:      () => import("./scripts/test_runner"),

    // add more commands here if needed

};

function printHelp() {
    const cmd_s = Object.keys(registry).sort().join(", ");
    console.log(`codexsun CLI

Usage:
  pnpm cx <command> [args...]

Commands:
  ${cmd_s}

Examples:
  pnpm cx migrate --app cxsun
  pnpm cx migrate --all
  pnpm cx test
`);
}

async function main() {
    const [, , cmd, ...args] = process.argv;
    if (!cmd || cmd === "-h" || cmd === "--help" || cmd === "help") {
        printHelp();
        return;
    }

    const loader = registry[cmd];
    if (!loader) {
        console.error(`Unknown command: ${cmd}\n`);
        printHelp();
        process.exit(1);
    }

    try {
        const mod = await loader();
        const handler = resolveHandler(mod);
        await handler(args);
    } catch (err) {
        console.error(`Command "${cmd}" failed:`, err);
        process.exit(1);
    }
}

// Explicitly ignore the returned Promise to satisfy the linter:
void main();
