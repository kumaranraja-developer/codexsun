#!/usr/bin/env ts-node

// cortex/cli/index.ts
import "dotenv/config";
import { showBootUsage } from "./doctor/boot-help";
import { runMigrations } from "../migration/Runner";
import { showMigrationRunnerUsage } from "./migration/runner-help";

type Action = "up" | "down" | "refresh" | "fresh";

type FlagValue = string | number | boolean;
type Flags = Record<string, FlagValue>;

function coerce(v: string | undefined): FlagValue {
    if (v === undefined) return true;                    // --flag
    const lower = v.toLowerCase();
    if (lower === "true") return true;                   // --flag=true
    if (lower === "false") return false;                 // --flag=false
    if (/^-?\d+$/.test(v)) return Number(v);             // --n=3
    return v;                                            // string fallback
}

function parseFlags(argv: string[]): Flags {
    const flags: Flags = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith("--")) continue;

        // support --no-print
        if (a === "--no-print") {
            flags.print = false;
            continue;
        }

        // support --key=value
        if (a.includes("=")) {
            const [k, v] = a.slice(2).split("=");
            flags[k] = coerce(v);
            continue;
        }

        // support space-separated: --key value
        const k = a.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
            flags[k] = coerce(next);
            i++; // consume value
        } else {
            flags[k] = true; // bare boolean flag
        }
    }
    return flags;
}

(async () => {
    const argv = process.argv.slice(2);

    if (argv.length === 0) {
        showBootUsage();
        console.error("\nTip: run `pnpm cx migration up` to apply pending migrations.");
        process.exit(1);
    }

    const [cmd, sub, ...rest] = argv;

    if (cmd === "migration") {
        const allowed: Action[] = ["up", "down", "refresh", "fresh"];

        if (!sub) {
            showMigrationRunnerUsage();
            process.exit(0);
        }

        const action = sub as Action;
        if (!allowed.includes(action)) {
            console.error(`❌ Unknown migration subcommand: ${sub}\n`);
            showMigrationRunnerUsage();
            process.exit(1);
        }

        const flags = parseFlags(rest);

        const profile =
            (flags.profile as string) ??
            process.env.DB_PROFILE ??
            "default";

        // steps: accept number or numeric string; reject/ignore invalid
        let steps: number | undefined = undefined;
        if (flags.steps !== undefined) {
            if (typeof flags.steps === "number") {
                steps = flags.steps;
            } else if (typeof flags.steps === "string") {
                const n = Number(flags.steps);
                if (!Number.isNaN(n)) steps = n;
            }
        }

        // print: default true; allow --print=false or --no-print
        const print =
            flags.print === undefined ? true : Boolean(flags.print);

        try {
            const t0 = Date.now();
            console.log(
                `[migration] starting… action=${action} profile=${profile}` +
                (steps !== undefined ? ` steps=${steps}` : "") +
                ` print=${print}`
            );

            await runMigrations({ action, profile, steps, print });

            console.log(`✅ migrations complete (${Date.now() - t0}ms)`);
            process.exit(0);
        } catch (err) {
            console.error("❌ migration runner failed:", err);
            process.exit(1);
        }
    }

    // Unknown top-level command
    console.error("❌ Unknown command.\n");
    showBootUsage();
    console.error("\nTip: run `pnpm cx migration up` to apply pending migrations.");
    showMigrationRunnerUsage();
    process.exit(1);
})();
