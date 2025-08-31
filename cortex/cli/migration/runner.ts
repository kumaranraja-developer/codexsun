// cortex/cli/migration/runner.ts

import runner, { runMigrations } from "../../migration/Runner";

type Action = "fresh" | "refresh" | "up" | "down";

type Flags = {
    action?: Action;              // which migration action to run
    profile?: string;             // DB profile name
    steps?: number | string;      // for refresh (how many batches to rollback/reapply)
    print?: boolean;              // print detailed logs
    [k: string]: string | number | boolean | undefined;
};

export async function MigrateRunner(flags: Flags = {}): Promise<void> {
    const t0 = Date.now();

    const action: Action = (flags.action as Action) ?? "up";
    const profile = (flags.profile as string) ?? process.env.DB_PROFILE ?? "default";
    const steps =
        flags.steps !== undefined
            ? typeof flags.steps === "string"
                ? Number(flags.steps)
                : flags.steps
            : undefined;
    const print = flags.print === undefined ? true : Boolean(flags.print);

    console.log(`[migration:runner] starting… action=${action} profile=${profile}`);

    try {
        // Preferred: call the low-level function with explicit options.
        await runMigrations({ action, profile, steps, print });

        // Alternatively, you could delegate to the convenience methods:
        // if (action === "fresh")   await runner.fresh();
        // if (action === "refresh") await runner.refresh();
        // if (action === "up")      await runner.up();
        // if (action === "down")    await runner.down();

        console.log(`✅ migration runner OK (${Date.now() - t0}ms)`);
    } catch (err) {
        console.error("❌ migration runner failed:", err);
        process.exitCode = 1;
    }
}

export default MigrateRunner;
