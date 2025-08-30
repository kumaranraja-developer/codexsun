// cortex/tests/test_migration_runner.ts
import { runMigrations } from "../migration/Runner";
import { discoverMigrationFiles, dynamicImportFile } from "../migration/discover";
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

async function distinctModelsFromFiles(files: string[]): Promise<Set<string>> {
    const models = new Set<string>();
    for (const f of files) {
        try {
            const mod = await dynamicImportFile(f);
            const defObj = mod?.default;
            const name = defObj?.tableName;
            if (typeof name === "string" && name.trim()) models.add(name);
        } catch {
            // ignore bad modules
        }
    }
    return models;
}

export async function migration_runner(opts: { profile?: string; verbose?: boolean } = {}): Promise<void> {
    const profile = opts.profile ?? process.env.CX_PROFILE ?? process.env.DB_PROFILE ?? "default";
    const verbose = opts.verbose ?? true;
    const log = (...a: any[]) => { if (verbose) console.log(...a); };

    const conn = (await getConnection(profile)) as ConnectionLike;
    try {
        await ensureMigrationsTable(conn);

        const files = discoverMigrationFiles();
        const models = await distinctModelsFromFiles(files);
        const expected = models.size;

        if (expected === 0) {
            log("[migration_runner]", green("no migration models discovered — nothing to test ✅"));
            return;
        }

        const passed: string[] = [];
        const pass = (label: string, note?: string) => {
            passed.push(label);
            log(`${green("✔")} ${label}${note ? dim(` — ${note}`) : ""}`);
        };

        // ---- DOWN (clean)
        {
            const out = await runMigrations({ action: "down", profile, print: false, conn });
            const rows = await readAppliedAll(conn);
            assert(rows.length === 0, `after down, expected applied=0 (got ${rows.length})`);
            pass("down (clean)", `dropped ${out.results.length} stmt(s)`);
        }

        // ---- UP (apply distinct models)
        {
            const out = await runMigrations({ action: "up", profile, print: false, conn });
            assert(out.results.length === expected, `up should apply ${expected} (got ${out.results.length})`);
            const rows = await readAppliedAll(conn);
            assert(rows.length === expected, `after up, applied should be ${expected} (got ${rows.length})`);
            pass("up", `applied ${out.results.length}/${expected}`);
        }

        // ---- UP (idempotent)
        {
            const before = (await readAppliedAll(conn)).length;
            const out = await runMigrations({ action: "up", profile, print: false, conn });
            assert(out.results.length === 0, `second up should be no-op (got ${out.results.length})`);
            const after = (await readAppliedAll(conn)).length;
            assert(after === before, "applied count changed on idempotent up");
            pass("up (idempotent)", "no changes");
        }

        // ---- REFRESH (drop + re-apply last batch)
        {
            const out = await runMigrations({ action: "refresh", profile, print: false, conn });
            assert(out.results.length === expected * 2, `refresh should emit ${expected * 2} stmts (got ${out.results.length})`);
            const rows = await readAppliedAll(conn);
            assert(rows.length === expected, `after refresh, applied should be ${expected} (got ${rows.length})`);
            pass("refresh", `re-applied ${expected}`);
        }

        // ---- ROLLBACK (last batch)
        {
            const out = await runMigrations({ action: "rollback", steps: 1, profile, print: false, conn });
            assert(out.results.length === expected, `rollback should drop ${expected} (got ${out.results.length})`);
            const rows = await readAppliedAll(conn);
            assert(rows.length === 0, `after rollback, applied should be 0 (got ${rows.length})`);
            pass("rollback (last batch)", `dropped ${out.results.length}`);
        }

        // ---- FRESH (drop all + up all)
        {
            const out = await runMigrations({ action: "fresh", profile, print: false, conn });
            // If nothing applied, expect only creates = expected
            assert(
                out.results.length === expected || out.results.length === expected * 2,
                `fresh should create ${expected} (or 2N if drops existed), got ${out.results.length}`
            );
            const rows = await readAppliedAll(conn);
            assert(rows.length === expected, `after fresh, applied should be ${expected} (got ${rows.length})`);
            pass("fresh", `applied ${expected}`);
        }

        // // ---- DOWN (final)
        // {
        //     const out = await runMigrations({ action: "down", profile, print: false, conn });
        //     assert(out.results.length === expected, `down should drop ${expected} (got ${out.results.length})`);
        //     const rows = await readAppliedAll(conn);
        //     assert(rows.length === 0, `after down, expected applied=0 (got ${rows.length})`);
        //     pass("down (final)", `dropped ${out.results.length}`);
        // }

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
