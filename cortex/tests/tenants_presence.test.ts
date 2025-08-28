// Verifies the `tenants` table exists and is usable (row count prints).
test("tenants table exists and is queryable", async () => {
    const { withConnection } = await import("../database/connection_manager");

    await withConnection(async (engine: any) => {
        // Check table existence in sqlite_master
        const res = await engine.query(
            `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
            ["tenants"]
        );
        const rows: any[] = Array.isArray(res?.rows) ? res.rows : (res ?? []);
        const exists =
            rows && rows.some((r: any) => (r.name ?? r["name"]) === "tenants");

        console.log(`[db] tenants table exists: ${exists}`);
        expect(exists).toBe(true);

        if (exists) {
            // Optional: show how many rows (should include default seed if migration ran)
            const cnt = await engine.query(`SELECT COUNT(*) AS c FROM tenants`);
            const crow = Array.isArray(cnt?.rows) ? cnt.rows[0] : (cnt as any[])[0];
            const n = (crow?.c ?? crow?.["c"] ?? 0) as number;
            console.log(`[db] tenants row count: ${n}`);
            expect(typeof n).toBe("number");
        }
    });
});
