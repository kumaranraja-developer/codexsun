// cortex/cli/doctor/boot.ts
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { loadEnvAndSettings } from "./settings.js";

const CWD = process.cwd();
const APPS_DIR = join(CWD, "apps");

const log = {
    ok:   (m: string) => console.log(`✅ ${m}`),
    warn: (m: string) => console.warn(`⚠️  ${m}`),
    sep:  (t: string) => console.log(`\n—— ${t} ——`),
};

export async function bootDoctor() {
    log.sep("Boot Doctor");
    // ensure env/settings are loaded up-front
    const settings = await loadEnvAndSettings();
    const nodeMajor = Number(process.versions.node.split(".")[0] ?? "0");
    if (Number.isFinite(nodeMajor) && nodeMajor >= 18) log.ok(`Node OK (${process.version})`);
    else log.warn(`Node ${process.version} — recommend >= 18`);
    if (settings?.APP_ENV) log.ok(`APP_ENV=${settings.APP_ENV}`);
}

export async function appsDoctor() {
    log.sep("Apps Doctor");
    try {
        const apps = readdirSync(APPS_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .sort();
        if (apps.length) {
            log.ok(`Found ${apps.length} app(s):`);
            for (const a of apps) console.log(`  • ${a}`);
        } else {
            log.warn("No apps found in /apps");
        }
    } catch {
        log.warn("No /apps directory");
    }
}
