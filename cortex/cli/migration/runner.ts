import * as fs from "node:fs";
import { withConnection, ensureDefaultEngineFromSettings } from "../../database/connection_manager";
import {
    ensureMigrationsTable,
    appliedForApp,
    markApplied,
    applySQL,
    listMigrationFiles,
    migrationPath,
    discoverAllApps,
    printDbInfo,
} from "./migrator";
import type { Engine } from "../../database/connection";

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
    console.log(`codexsun migrate

Usage:
  cx migrate --app <name>
  cx migrate --all
  [--dry-run] [--verbose]
`);
}

async function runAppMigrations(appName: string, flags: Flags) {
    await withConnection(async (engine: Engine) => {
        if (flags.verbose) await printDbInfo(engine, `[${appName}] `);

        const files = listMigrationFiles(appName);
        if (!files.length) {
            console.log(`[${appName}] no migrations found.`);
            return;
        }

        await ensureMigrationsTable(engine);
        const applied = new Set(await appliedForApp(engine, appName));
        const pending = files.filter(f => !applied.has(f));

        if (!pending.length) {
            console.log(`[${appName}] up-to-date.`);
            return;
        }

        console.log(`[${appName}] applying ${pending.length} migration(s)...`);
        for (const file of pending) {
            const sql = fs.readFileSync(migrationPath(appName, file), "utf8");
            if (flags.verbose) console.log(` - ${file}`);
            await applySQL(engine, sql, !!flags.dryRun, !!flags.verbose);
            if (!flags.dryRun) await markApplied(engine, appName, file);
        }
        console.log(`[${appName}] done.`);
    });
}

const run = async (...argv: string[]) => {
    const flags = parseFlags(argv);
    if (flags.help) return printHelp();

    await ensureDefaultEngineFromSettings();

    const apps = flags.all ? discoverAllApps() : [flags.app || "cxsun"];
    if (!apps.length) {
        console.log("No apps found to migrate.");
        return;
    }
    for (const app of apps) await runAppMigrations(app, flags);
};

export default run;
