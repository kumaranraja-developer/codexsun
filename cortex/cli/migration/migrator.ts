#!/usr/bin/env node

// cortex/cli/cx.ts

import { runMigrations } from "../../migration/Runner";

function parseArgs(argv: string[]) {
    const args = argv.slice(2);
    const cmd = args[0] || "";
    const sub = args[1] || "";
    const opts: any = {};

    for (let i = 2; i < args.length; i++) {
        const a = args[i];
        if (a === "--steps" || a === "--batches") opts.steps = Number(args[++i]);  // alias
        else if (a === "--to-batch") opts.toBatch = Number(args[++i]);
        else if (a === "--profile") opts.profile = args[++i];
        else if (a === "--quiet") opts.print = false;
        else if (a === "--print") opts.print = true;
    }

    return { cmd, sub, opts };
}

(async () => {
    const { cmd, sub, opts } = parseArgs(process.argv);

    if (cmd !== "migrate") {
        console.error(`Unknown command: ${cmd}\nUsage: cx migrate <up|down|drop|rollback|fresh|refresh> [--steps N|--batches N] [--to-batch B] [--profile PROF] [--quiet]`);
        process.exit(1);
    }

    let action: "up" | "down" | "drop" | "rollback" | "fresh" | "refresh" = "up";
    if (["up","down","drop","rollback","fresh","refresh"].includes(sub)) action = sub as any;

    await runMigrations({ action, ...opts });
})().catch((e) => {
    console.error(e?.stack || e?.message || e);
    process.exit(1);
});
