/**
 * Drop all user tables, then re-run migrations from scratch.
 */

import { withConnection } from "../database/connection_manager";
import migrate from "./runner";
import { dropAllTables, discoverAllApps, printDbInfo } from "./migrator";
import type { Engine } from "../database/Engine";

type Flags = { app?: string; all?: boolean; verbose?: boolean; dryRun?: boolean; help?: boolean };

function parseFlags(argv: string[]): Flags {
    const f: Flags = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--app") f.app = argv[++i];
        else if (a === "--all") f.all = true;
        else if (a === "--dry-run") f.dryRun = true;
        else if (a === "--verbose" || a === "-v") f.verbose = true;
        else if (a === "-h" || a === "--help" || a === "help") f.help = true;
    }
    return f;
}

function printHelp() {
    console.log(`codexsun fresh

Usage:
  pnpm cx fresh --app <name>
  pnpm cx fresh --all
`);
}

async function freshApp(appName: string, flags: Flags) {
    await withConnection(async (engine: Engine) => {
        if (flags.verbose) await printDbInfo(engine, `[${appName}] `);

        if (flags.dryRun) {
            console.log(`[${appName}] would DROP all tables (dry-run)`);
            return;
        }
        await dropAllTables(engine, !!flags.verbose);
    });

    console.log(`[${appName}] re-running migrations...`);
    await migrate(["--app", appName, ...(flags.verbose ? ["-v"] : [])]);
    console.log(`✅ ${appName}: fresh complete`);
}

const run: (argv: string[]) => Promise<void> = async (argv) => {
    const flags = parseFlags(argv);
    if (flags.help) return printHelp();

    const apps = flags.all ? discoverAllApps() : [flags.app || "cxsun"];
    if (apps.length === 0) {
        console.log("No apps found for fresh.");
        return;
    }
    for (const app of apps) {
        await freshApp(app, flags);
    }
};

export default run;
