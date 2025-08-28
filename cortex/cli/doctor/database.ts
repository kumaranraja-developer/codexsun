// root/cortex/cli/doctor/database.ts
import { getDefaultEngine } from "../../database/connection";
import { runOrWatch, ok, err, sep, warn } from "./_runner";

export async function runDoctorDatabase(opts: { watch?: boolean }) {
    await runOrWatch("database", async () => {
        sep("Database Doctor");
        const eng = getDefaultEngine();

        // Health
        const alive = await eng.test_connection?.();
        if (!alive) {
            err("Health check failed");
            return false;
        }
        ok("Health check OK");

        // Transaction probe (best-effort)
        try {
            if (eng.begin && eng.commit && eng.rollback) {
                await eng.begin();
                ok("BEGIN ok");
                // Create a tiny scratch op that should be valid on all engines
                // (No-op for SQLite; harmless for others)
                try {
                    await eng.execute?.("/* cx doctor write probe */ SELECT 1");
                } catch {
                    // Some drivers won't allow SELECT via execute; try fetchone
                    await eng.fetchone?.("SELECT 1");
                }
                await eng.commit();
                ok("COMMIT ok");
            } else {
                warn("Engine does not expose transaction primitives; skipping tx probe");
            }
        } catch (e: any) {
            try { await eng.rollback?.(); } catch {}
            err(`Transaction probe failed: ${e?.message || e}`);
            return false;
        }

        // Read probe
        try {
            const one = await eng.fetchone?.("SELECT 1 AS ok");
            if (one) ok("Read probe OK");
            else warn("Read probe returned null");
        } catch (e: any) {
            err(`Read probe failed: ${e?.message || e}`);
            return false;
        }

        return true;
    }, opts.watch);
}
