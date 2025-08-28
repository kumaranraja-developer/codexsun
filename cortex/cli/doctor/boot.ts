// root/cortex/cli/doctor/boot.ts

import { getSettings } from "../../settings/get_settings";
import { getDefaultEngine } from "../../database/connection";
import { runOrWatch, ok, warn, err, sep } from "./_runner";

export async function runDoctorBoot(opts: { watch?: boolean }) {
    await runOrWatch("boot", async () => {
        sep("Boot Doctor");

        // Load .env into process.env (layered) and parse to typed settings
        const settings = await getSettings("default", true);
        ok(`Settings loaded (APP_ENV=${settings.APP_ENV}, LOG_LEVEL=${settings.logLevel})`);

        // basic env keys presence
        const missing = ["APP_NAME", "APP_ENV", "APP_URL", "DB_ENGINE"].filter((k) => !process.env[k]);
        if (missing.length) warn(`Missing recommended env keys: ${missing.join(", ")}`);

        // quick DB health
        const engine = getDefaultEngine();
        const alive = await engine.test_connection?.();
        if (alive) ok(`Database (${settings.DB_ENGINE}) responded to health check`);
        else err(`Database (${settings.DB_ENGINE}) did not respond to health check`);

        return !!alive;
    }, opts.watch);
}
