// cortex/tests/test_migration_runner.ts
import { runMigrations } from "../migration/Runner";
import { discoverMigrationFiles } from "../migration/discover";
import { getConnection } from "../database/connection_manager";
import {
    ensureMigrationsTable,
    readAppliedAll,
    type ConnectionLike,
} from "../migration/tracking";

function assert(cond: any, msg: string) {
    if (!cond) throw new Error(`[assert] ${msg}`);
}

function green(s: string) { return `\x1b[32m${s}\x1b[0m`; }
function dim(s: string) { return `\x1b[2m${s}\x1b[0m`; }

export async function migration_runner(opts: { profile?: string; verbose?: boolean } = {}): Promise<void> {
    const profile = opts.profile ?? process.env.CX_PROFILE ?? process.env.DB_PROFILE ?? "default";
    const verbose = opts.verbose ?? true;

    const log = (...a: any[]) => { if (verbose) console.log(...a); };

    const passed: string[] = [];
    const pass = (label: string, note?: string) => {
        passed.push(label);
        log(`${green("✔")} ${label}${note ? dim(` — ${note}`) : ""}`);
    };

    const conn = (await getConnection(profile)) as ConnectionLike;
    try {
        // Ensure tracking table & discover files
        await ensureMigrationsTable(conn);

        const files = discoverMigrationFiles();
        if (files.length === 0) {
            log("[migration_runner]", green("no migration files discovered — nothing to test ✅"));
            return;
        }

        // ---- DOWN (clean start)
        {
            const out = await runMigrations({ action: "down", profile, print: false });
            const rows = await readAppliedAll(conn);
            assert(rows.length === 0, `after down, expected applied=0 (got ${rows.length})`);
            pass("down (clean)", `dropped ${out.results.length} stmt(s)`);
        }

        // ---- UP (apply all)
        {
            const out = await runMigrations({ action: "up", profile, print: false });
            assert(out.results.length === files.length, `up should apply ${files.length} (got ${out.results.length})`);
            const rows = await readAppliedAll(conn);
            assert(rows.length === files.length, `after up, applied should be ${files.length} (got ${rows.length})`);
            pass("up", `applied ${out.results.length}/${files.length}`);
        }

        // ---- UP (idempotent)
        {
            const before = (await readAppliedAll(conn)).length;
            const out = await runMigrations({ action: "up", profile, print: false });
            assert(out.results.length === 0, `second up should be no-op (got ${out.results.length})`);
            const after = (await readAppliedAll(conn)).length;
            assert(after === before, "applied count changed on idempotent up");
            pass("up (idempotent)", "no changes");
        }

        // ---- REFRESH (rollback last batch + re-apply)
        {
            const out = await runMigrations({ action: "refresh", profile, print: false });
            assert(out.results.length === files.length * 2, `refresh should emit ${files.length * 2} stmts (got ${out.results.length})`);
            const rows = await readAppliedAll(conn);
            assert(rows.length === files.length, `after refresh, applied should be ${files.length} (got ${rows.length})`);
            pass("refresh", `re-applied ${files.length}`);
        }

        // ---- ROLLBACK (last batch)
        {
            const out = await runMigrations({ action: "rollback", steps: 1, profile, print: false });
            assert(out.results.length === files.length, `rollback should drop ${files.length} (got ${out.results.length})`);
            const rows = await readAppliedAll(conn);
            assert(rows.length === 0, `after rollback, applied should be 0 (got ${rows.length})`);
            pass("rollback (last batch)", `dropped ${out.results.length}`);
        }

        // ---- FRESH (drop all + up all)
        {
            const out = await runMigrations({ action: "fresh", profile, print: false });
            // If DB was empty, expect only creates = files.length
            assert(
                out.results.length === files.length || out.results.length === files.length * 2,
                `fresh should create ${files.length} (or 2N if drops happened), got ${out.results.length}`
            );
            const rows = await readAppliedAll(conn);
            assert(rows.length === files.length, `after fresh, applied should be ${files.length} (got ${rows.length})`);
            pass("fresh", `applied ${files.length}`);
        }

        // // ---- DOWN (final cleanup)
        // {
        //     const out = await runMigrations({ action: "down", profile, print: false });
        //     const rows = await readAppliedAll(conn);
        //     assert(rows.length === 0, `after down, expected applied=0 (got ${rows.length})`);
        //     pass("down (final)", `dropped ${out.results.length}`);
        // }

        // Summary
        log("");
        log("[migration_runner] passed steps:");
        passed.forEach((p, i) => log(`  ${green("✔")} ${i + 1}. ${p}`));
        log("");
        log("[migration_runner] all actions passed ✅");
    } finally {
        if (typeof (conn as any).close === "function") await (conn as any).close();
        else if (typeof (conn as any).end === "function") await (conn as any).end();
    }
}
