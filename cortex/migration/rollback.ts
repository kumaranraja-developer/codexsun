/**
 * codexsun rollback runner
 *
 * Assumes each migration has a sibling *_down.sql file for rollback.
 */

import fs from "node:fs";
import { withConnection } from "../database/connection_manager";
import {
    applySQL,
    lastApplied,
    discoverAllApps,
    migrationPath,
} from "./migrator";

type Flags = { app?: string; all?: boolean; steps?: number; dryRun?: boolean; verbose?: boolean; help?: boolean };

function parseFlags(argv: string[]): Flags {
    const f: Flags = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--app") f.app = argv[++i];
        else if (a === "--all") f.all = true;
        else if (a === "--steps") f.steps = Math.max(1, parseInt(argv[++i], 10) || 1);
        else if (a === "--dry-run") f.dryRun = true;
        else if (a === "--verbose" || a === "-v") f.verbose = true;
        else if (a === "-h" || a === "--help" || a === "help") f.help = true;
    }
    return f;
}

function printHelp() {
    console.log(`codexsun rollback

Usage:
  pnpm cx rollback --app <name> [--steps N]
  pnpm cx rollback --all [--steps N]
`);
}

async function rollbackApp(appName: string, flags: Flags) {
    await withConnection(async (db) => {
        const filenames = await lastApplied(db, appName, flags.steps || 1);
        if (filenames.length === 0) {
            console.log(`[${appName}] no migrations to rollback`);
            return;
        }

        for (const fname of filenames) {
            const downFile = fname.replace(/\.sql$/, "_down.sql");
            const downPath = migrationPath(appName, downFile);

            if (!fs.existsSync(downPath)) {
                console.warn(`[${appName}] missing rollback file: ${downFile}`);
                continue;
            }

            console.log(`Rolling back (${appName}): ${fname} → ${downFile}`);
            const sql = fs.readFileSync(downPath, "utf8");

            if (!flags.dryRun) {
                await applySQL(db, sql);
                // noinspection SqlNoDataSourceInspection
                await db.run?.(
                    `DELETE FROM migrations WHERE app = ? AND filename = ?`,
                    [appName, fname]
                );
            }
        }
    });

    console.log(`✅ ${appName}: rollback complete${flags.dryRun ? " (dry-run)" : ""}`);
}

const run: (argv: string[]) => Promise<void> = async (argv) => {
    const flags = parseFlags(argv);
    if (flags.help) return printHelp();

    const apps = flags.all ? discoverAllApps() : [flags.app || "cxsun"];
    if (apps.length === 0) {
        console.log("No apps found to rollback.");
        return;
    }
    for (const app of apps) {
        await rollbackApp(app, flags);
    }
};

export default run;
