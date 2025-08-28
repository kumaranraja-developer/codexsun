// cortex/commands/doctor/boot.ts
//
// Boot Doctor (one-shot):
// - Loads settings without starting watchers
// - Runs ordered boot checks (env → settings → database via ./database.ts)
// - Prints a compact report
// - Cleans up and exits deterministically
//
// Notes:
// - All database logic now lives in ./database.ts (separate CLI).
// - This file only orchestrates boot order and summary output.

import { getSettings } from "../../get_settings";

type BootCheck = {
    name: string;
    run: () => Promise<{ ok: boolean; info?: string; code?: string; detail?: string }>;
};

async function tryStopSettingsWatcherIfAny() {
    try {
        const mod = await import("../../get_settings");
        const stop = (mod as any).stopSettingsWatchIfAny;
        if (typeof stop === "function") await stop();
    } catch {
        /* optional; ignore if not present */
    }
}

/** Delegate database health to ./database.ts */
async function runDatabasePhase(settings: any): Promise<{ ok: boolean; info?: string; code?: string; detail?: string }> {
    try {
        // Expect one of: doctorDatabase / checkDatabase / run / default
        const mod = await import("./database");
        const fn =
            (mod as any).doctorDatabase ||
            (mod as any).checkDatabase ||
            (mod as any).run ||
            (mod as any).default;

        if (typeof fn !== "function") {
            return { ok: false, detail: "No callable exported function in doctor/database.ts" };
        }

        const res = await fn(settings);
        // Normalize to a standard shape
        if (typeof res === "boolean") {
            return { ok: res, info: `engine=${settings?.DB_ENGINE ?? "unknown"}` };
        }
        const ok = !!res?.ok;
        const code = res?.code;
        const detail = res?.detail;
        const engine = res?.engine ?? settings?.DB_ENGINE ?? "unknown";
        return { ok, info: `engine=${engine}`, code, detail };
    } catch (err: any) {
        return { ok: false, detail: err?.message || String(err) };
    }
}

export async function doctorBoot() {
    let exitCode = 1;

    console.log("— Boot Doctor —");

    // 1) Load settings without watchers (doctor is one-shot)
    let settings: any;
    try {
        // If your getSettings accepts {watch:false}, use it; otherwise call normally.
        settings =
            (await (getSettings as any)({ watch: false })) ??
            (await getSettings());
    } catch (err: any) {
        console.error("❌ Failed to load settings:", err?.message || err);
        await tryStopSettingsWatcherIfAny();
        process.exit(1);
        return;
    }

    const env = settings?.APP_ENV ?? "unknown";
    const logLevel = settings?.LOG_LEVEL ?? "info";
    console.log(`✅ Settings loaded (APP_ENV=${env}, LOG_LEVEL=${logLevel})`);

    // 2) Define boot order checks
    const checks: BootCheck[] = [
        {
            name: "Environment",
            run: async () => {
                // Quick sanity checks without keeping the loop alive
                const nodeMajor = parseInt(process.versions.node.split(".")[0] || "0", 10);
                const ok = Number.isFinite(nodeMajor) && nodeMajor >= 18;
                return {
                    ok,
                    info: `node=${process.version}`,
                    detail: ok ? undefined : "Node.js >= 18 is recommended",
                };
            },
        },
        {
            name: "Database",
            run: async () => runDatabasePhase(settings),
        },
    ];

    // 3) Execute checks in order and report
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

    // 4) Clean up & exit deterministically
    await tryStopSettingsWatcherIfAny();

    exitCode = allOk ? 0 : 1;

    // If you want to diagnose lingering handles during development:
    if (process.env.DEBUG_NODE_HANDLES === "1") {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const why = require("why-is-node-running");
            setTimeout(() => why(), 2000);
        } catch {
            // not installed; ignore
        }
    } else {
        process.exit(exitCode);
    }
}

// Allow direct execution via tsx if needed
if (require.main === module) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    doctorBoot();
}
