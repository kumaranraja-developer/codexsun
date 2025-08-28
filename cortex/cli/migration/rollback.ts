import * as fs from "node:fs";
import { withConnection, ensureDefaultEngineFromSettings } from "../../database/connection_manager";
import {
    applySQL,
    lastApplied,
    discoverAllApps,
    migrationPath,
    printDbInfo,
    unmarkApplied,
} from "./migrator";
import type { Engine } from "../../database/connection";

type Flags = { app?: string; all?: boolean; steps?: number; dryRun?: boolean; verbose?: boolean; help?: boolean };

function parseFlags(argv: string[]): Flags {
    const f: Flags = { steps: 1 };
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
  cx rollback --app <name> [--steps N]
  cx rollback --all [--steps N]
  [--dry-run] [--verbose]
`);
}

async function rollbackApp(appName: string, flags: Flags) {
    await withConnection(async (engine: Engine) => {
        if (flags.verbose) await printDbInfo(engine, `[${appName}] `);

        const names = await lastApplied(engine, appName, flags.steps ?? 1);
        if (!names.length) {
            console.log(`[${appName}] nothing to rollback.`);
            return;
        }

        console.log(`[${appName}] rolling back ${names.length} step(s)...`);
        for (const up of names) {
            const down = up.replace(/\.sql$/i, "_down.sql");
            const p = migrationPath(appName, down);
            if (!fs.existsSync(p)) {
                console.warn(`[${appName}] missing down file for ${up} -> ${down} (skipping)`);
                continue;
            }
            const sql = fs.readFileSync(p, "utf8");
            if (flags.verbose) console.log(` - ${down}`);
            await applySQL(engine, sql, !!flags.dryRun, !!flags.verbose);
            if (!flags.dryRun) await unmarkApplied(engine, appName, up);
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
        console.log("No apps found to rollback.");
        return;
    }
    for (const app of apps) await rollbackApp(app, flags);
};

export default run;
