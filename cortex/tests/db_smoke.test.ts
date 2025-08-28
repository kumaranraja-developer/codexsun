/**
 * These tests require a real database connection, and are run as part of the integration tests.
 */


import { withConnection } from "../database/connection_manager";


export async function register(t: (name: string, fn: (ctx:{scope:string})=>Promise<void>) => void) {
    t("sqlite: kv roundtrip works", async ({ scope }) => {
        const value = await withConnection(async (db) => {
            if (db.kind !== "sqlite") throw new Error(`Expected sqlite, got ${db.kind}`);
            await db.execute?.(
                "INSERT INTO kv_store (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v",
                ["hello", `world-${Date.now()}`]
            );
            const r = await db.query<{ v: string }>("SELECT v FROM kv_store WHERE k = ?", ["hello"]);
            return r.rows[0]?.v;
        }, scope);
        if (!value) throw new Error("KV not found after upsert");
    });

    t("sqlite: ping now()", async ({ scope }) => {
        const now = await withConnection(async (db) => {
            const r = await db.query<{ now: string }>("SELECT datetime('now') AS now");
            return r.rows[0]?.now;
        }, scope);
        if (!now) throw new Error("No datetime from sqlite");
    });
}
