// cortex/cli/doctor/boot-help.ts
import { getEnv } from "../../settings/get_settings";
import { getDbConfig } from "../../database/getDbConfig";
import {prepareEngine, fetchAll, teardownEngine} from "../../database/connection_manager";

// If you have a real Profile type exported, import it; otherwise alias to string
type Profile = string;

type Flags = { [k: string]: string | boolean | undefined };

export async function bootDoctor(flags: Flags = {}): Promise<void> {
    const t0 = Date.now();

    const profile: Profile =
        (typeof flags.profile === "string" && (flags.profile as Profile)) ||
        (process.env.PROFILE as Profile) ||
        (process.env.CX_PROFILE as Profile) ||
        "default";

    console.log(`[doctor:boot] loading settings… profile=${profile}`);

    // Optional: log resolved cfg (doesn't affect prepareEngine)
    const raw = getEnv(profile);
    const cfg = getDbConfig(raw);
    const driver = (cfg as any).driver ?? (cfg as any).engine ?? "unknown";
    const cfgKey = (cfg as any).cfgKey ?? "";
    console.log(`[doctor:boot] resolved driver=${driver}${cfgKey ? ` cfgKey=${cfgKey}` : ""}`);

    try {
        await prepareEngine(profile);
        console.log("✅ engine ready");

        const rows = await fetchAll(profile, "select 1 as ok");
        const ok = Array.isArray(rows) && rows[0] && (rows[0].ok === 1 || rows[0]["1"] === 1);
        console.log(ok ? "✅ sanity query ok" : "⚠ unexpected:", rows);

        console.log(`✅ boot OK (${Date.now() - t0}ms)`);
    } catch (err) {
        console.error("❌ boot failed:", err);
        process.exitCode = 1;
    } finally {
        // 🔒 make the process exit immediately (fixes "Terminate batch job?" on Windows)
        await teardownEngine(profile);
    }
}
