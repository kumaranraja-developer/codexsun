// cortex/cli/doctor/boot.ts
import { readdirSync } from "node:fs";
import { join } from "node:path";

const CWD = process.cwd();
const APPS_DIR = join(CWD, "apps");

const log = {
    ok: (m: string) => console.log(`✅ ${m}`),
    warn: (m: string) => console.warn(`⚠️  ${m}`),
    sep: (t: string) => console.log(`\n—— ${t} ——`),
};

export async function bootDoctor() {
    log.sep("Boot Doctor");
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
