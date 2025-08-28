/**
 * codexsun fresh runner
 *
 * Drops all tables and re-runs migrations from scratch for an app (or all apps).
 */

import { withConnection } from "../database/connection_manager";
import migrate from "./runner";
import { dropAllTables, discoverAllApps } from "./migrator";

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
    await withConnection(async (db) => {
        if (flags.dryRun) {
            console.log(`[${appName}] would DROP all tables (dry-run)`);
            return;
        }
        await dropAllTables(db);
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
