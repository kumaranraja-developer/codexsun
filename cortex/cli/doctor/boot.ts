// cortex/commands/doctor/boot.ts
import { getSettings as _getSettings } from "../../settings/get_settings";

type CheckResult = { ok: boolean; info?: string; code?: string; detail?: string };

async function getSettingsNoWatch(): Promise<any> {
    try {
        const maybe = await (_getSettings as any)({ watch: false });
        if (maybe) return maybe;
    } catch { /* ignore and fall through */ }
    return _getSettings();
}

async function stopSettingsWatcherIfAny(): Promise<void> {
    try {
        const mod: any = await import("../../settings/get_settings");
        if (typeof mod.stopSettingsWatchIfAny === "function") await mod.stopSettingsWatchIfAny();
    } catch { /* optional */ }
}

async function runDatabasePhase(settings: any): Promise<CheckResult> {
    try {
        const mod: any = await import("./database");
        const fn = mod.doctorDatabase || mod.checkDatabase || mod.run || mod.default;
        if (typeof fn !== "function") {
            return { ok: false, detail: "doctor/database.ts does not export a callable function" };
        }
        const r = await fn(settings);
        const ok = !!r?.ok;
        const engine = r?.engine ?? settings?.DB_ENGINE ?? "unknown";
        return { ok, info: `engine=${engine}`, code: r?.code, detail: r?.detail };
    } catch (e: any) {
        return { ok: false, detail: e?.message || String(e) };
    }
}

export async function runDoctorBoot(): Promise<void> {
    let exitCode = 1;
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
        await stopSettingsWatcherIfAny();
        process.exit(1);
        return;
    }

    // 2) Checks in order
    const checks: Array<{ name: string; run: () => Promise<CheckResult> }> = [
        {
            name: "Environment",
            run: async () => {
                const nodeMajor = Number((process.versions.node.split(".")[0] || "0"));
                const ok = Number.isFinite(nodeMajor) && nodeMajor >= 18;
                return { ok, info: `node=${process.version}`, detail: ok ? undefined : "Node.js >= 18 is recommended" };
            },
        },
        {
            name: "Database",
            run: async () => runDatabasePhase(settings),
        },
    ];

    let allOk = true;
    for (const check of checks) {
        try {
            const res = await check.run();
            if (res.ok) {
                console.log(`✅ ${check.name}${res.info ? ` (${res.info})` : ""}`);
            } else {
                allOk = false;
                console.error(`❌ ${check.name} failed${res.info ? ` (${res.info})` : ""}`);
                if (res.code) console.error(`   code=${res.code}`);
                if (res.detail) console.error(`   detail=${res.detail}`);
            }
        } catch (err: any) {
            allOk = false;
            console.error(`❌ ${check.name} threw`, err?.message || err);
        }
    }

    await stopSettingsWatcherIfAny();
    exitCode = allOk ? 0 : 1;
    process.exit(exitCode);
}

// Provide multiple export shapes for CLI compatibility
export { runDoctorBoot as doctorBoot };
export default runDoctorBoot;
