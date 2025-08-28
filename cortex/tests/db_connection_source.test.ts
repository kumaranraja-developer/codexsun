import path from "node:path";

// Prints which SQLite connection is used and asserts it's NOT in-memory.
test("sqlite connection source (file vs :memory:)", async () => {
    const { withConnection } = await import("../database/connection_manager");
    let filePath = "";

    await withConnection(async (engine: any) => {
        // PRAGMA database_list → [{seq, name, file}]
        const res = await engine.query(`PRAGMA database_list`);
        const rows: any[] = Array.isArray(res?.rows) ? res.rows : (res ?? []);
        const main = rows.find((r: any) => (r.name ?? r["name"]) === "main");
        filePath = (main?.file ?? main?.["file"] ?? "") as string;

        console.log(`[db] sqlite main file: ${filePath || ":memory:"}`);
    });

    // Assert we are using a *real* file DB, not :memory:
    expect(!!filePath && filePath !== ":memory:").toBe(true);
});

// (Optional) also print configured target from your settings, if available
test("configured sqlite target (from settings if exposed)", async () => {
    try {
        const mod: any = await import("../../settings/get_settings");
        const settings = typeof mod.getSettings === "function" ? mod.getSettings() : mod.default?.();
        const cfgPath = settings?.sqlite?.file || settings?.db?.sqlite?.file;
        if (cfgPath) {
            console.log(`[config] sqlite file (settings): ${path.resolve(cfgPath)}`);
        } else {
            console.log(`[config] sqlite file (settings): <not exposed>`);
        }
        expect(true).toBe(true); // informational only
    } catch {
        console.log(`[config] get_settings not available or different shape (skipped)`);
        expect(true).toBe(true);
    }
});
