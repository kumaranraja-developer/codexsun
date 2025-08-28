// cortex/commands/doctor/boot.ts
import { getSettings as _getSettings } from "../../settings/get_settings"; // <- your path
import { runDoctorDatabase } from "./database";

type CheckResult = { ok: boolean; info?: string; code?: string; detail?: string };

async function getSettingsNoWatch(): Promise<any> {
    try {
        const maybe = await (_getSettings as any)({ watch: false });
        if (maybe) return maybe;
    } catch { /* ignore and fall through */ }
    return _getSettings();
}

export async function runDoctorBoot(): Promise<void> {
    console.log("— Boot Doctor —");

    // 1) Settings (no watchers)
    let settings: any;
    try {
        settings = await getSettingsNoWatch();
        const env = settings?.APP_ENV ?? "unknown";
        const logLevel = settings?.LOG_LEVEL ?? "info";
        console.log(`✅ Settings loaded (APP_ENV=${env}, LOG_LEVEL=${logLevel})`);
    } catch (err: any) {
        console.error("❌ Failed to load settings:", err?.message || err);
        process.exit(1);
        return;
    }

    // 2) Checks in order
    // Environment
    {
        const nodeMajor = Number((process.versions.node.split(".")[0] || "0"));
        const ok = Number.isFinite(nodeMajor) && nodeMajor >= 18;
        if (ok) {
            console.log(`✅ Environment (node=${process.version})`);
        } else {
            console.error(`❌ Environment failed (node=${process.version})`);
            console.error("   detail=Node.js >= 18 is recommended");
        }
    }

    // Database (delegated)
    {
        const res = await runDoctorDatabase(settings);
        if (res.ok) {
            console.log(`✅ Database (engine=${res.engine ?? settings?.DB_ENGINE ?? "unknown"})`);
            process.exit(0);
            return;
        } else {
            console.error(`❌ Database failed (engine=${res.engine ?? settings?.DB_ENGINE ?? "unknown"})`);
            if (res.code) console.error(`   code=${res.code}`);
            if (res.detail) console.error(`   detail=${res.detail}`);
            process.exit(1);
            return;
        }
    }
}

// Also export a secondary alias if your CLI references it
export { runDoctorBoot as doctorBoot };
export default runDoctorBoot;
