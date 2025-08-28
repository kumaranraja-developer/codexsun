/**
 * Apply new migrations for one app (or all apps).
 */

import fs from "node:fs";
import { withConnection } from "../database/connection_manager";
import {
    ensureMigrationsTable,
    hasApplied,
    markApplied,
    applySQL,
    listMigrationFiles,
    migrationPath,
    discoverAllApps,
    printDbInfo,
} from "./migrator";
import type { Engine } from "../database/Engine";

type Flags = { app?: string; all?: boolean; dryRun?: boolean; verbose?: boolean; help?: boolean };

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
  pnpm cx migrate --app <name>
  pnpm cx migrate --all
  pnpm cx migrate --app <name> [--dry-run] [-v]
`);
}

async function runAppMigrations(appName: string, flags: Flags) {
    const files = listMigrationFiles(appName);
    if (files.length === 0) {
        console.warn(`(skip) No migrations for "${appName}"`);
        return;
    }
    if (flags.verbose) console.log(`[${appName}] found ${files.length} file(s)`);

    await withConnection(async (engine: Engine) => {
        if (flags.verbose) await printDbInfo(engine, `[${appName}] `);
        await ensureMigrationsTable(engine);

        for (const file of files) {
            const applied = await hasApplied(engine, appName, file);
            if (applied) {
                if (flags.verbose) console.log(`[${appName}] already applied: ${file}`);
                continue;
            }

            const sql = fs.readFileSync(migrationPath(appName, file), "utf8");
            console.log(`Applying migration (${appName}): ${file}`);

            if (!flags.dryRun) {
                await applySQL(engine, sql, !!flags.verbose);
                await markApplied(engine, appName, file);
            }
        }
    });

    console.log(`✅ ${appName}: migrations ${flags.dryRun ? "checked (dry-run)" : "applied"}`);
}

const run: (argv: string[]) => Promise<void> = async (argv) => {
    const flags = parseFlags(argv);
    if (flags.help) return printHelp();

    const apps = flags.all ? discoverAllApps() : [flags.app || "cxsun"];
    if (apps.length === 0) {
        console.log("No apps found to migrate.");
        return;
    }
    for (const app of apps) {
        await runAppMigrations(app, flags);
    }
};

export default run;
