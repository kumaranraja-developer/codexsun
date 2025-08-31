#!/usr/bin/env ts-node
// cortex/cli/index.ts
import "dotenv/config";

type Handler = (argv: string[]) => Promise<void> | void;

function usage(extra = "") {
    return [
        "Usage: cx <command> [...args]",
        "",
        "Commands:",
        "  migrate <fresh|refresh|up|down> [--profile=NAME]",
        "  doctor:boot",
        "  doctor:db",
        extra && "",
        extra && extra.trim(),
    ].filter(Boolean).join("\n");
}

const handlers: Record<string, Handler> = {
    async help() {
        console.log(usage());
    },

    async "doctor:boot"() {
        const { bootDoctor } = await import("./doctor/boot");
        await bootDoctor();
    },

    async "doctor:db"() {
        const { databaseDoctor } = await import("./doctor/database");
        await databaseDoctor();
    },

    async migrate(argv) {
        const [action, ...rest] = argv;
        if (!action) {
            console.error(usage("Examples:\n  cx migrate fresh\n  cx migrate up --profile=staging"));
            process.exit(1);
        }
        const { runMigrate } = await import("./doctor/migrate");
        await runMigrate(action, parseFlags(rest));
    },
};

function parseFlags(argv: string[]) {
    const flags: Record<string, string | boolean> = {};
    for (const a of argv) {
        if (a.startsWith("--")) {
            const [k, v] = a.slice(2).split("=");
            flags[k] = v ?? true;
        }
    }
    return flags;
}

(async function main() {
    const [cmd, ...rest] = process.argv.slice(2);
    const handler = handlers[cmd ?? "help"] ?? handlers.help;
    try {
        await handler(rest);
    } catch (err) {
        console.error("❌ CLI error:", err);
        process.exit(1);
    }
})();
