// root/cortex/cli/doctor/apps.ts
import { getSettings } from "../../settings/get_settings";
import { runOrWatch, ok, warn, err, sep } from "./_runner";
import http from "node:http";
import https from "node:https";

function ping(url: string, timeoutMs = 1500): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const m = url.startsWith("https:") ? https : http;
            const req = m.request(url, { method: "HEAD", timeout: timeoutMs }, (res) => {
                res.resume();
                resolve(res.statusCode! >= 200 && res.statusCode! < 500);
            });
            req.on("timeout", () => { req.destroy(); resolve(false); });
            req.on("error", () => resolve(false));
            req.end();
        } catch {
            resolve(false);
        }
    });
}

export async function runDoctorApps(opts: { watch?: boolean }) {
    await runOrWatch("apps", async () => {
        sep("Apps Doctor");
        const s = await getSettings("default", true);
        ok(`APP_NAME=${s.APP_NAME} APP_ENV=${s.APP_ENV}`);

        // Recommended keys
        const missing = ["APP_KEY", "APP_URL"].filter((k) => !process.env[k]);
        if (missing.length) warn(`Missing recommended keys: ${missing.join(", ")}`);

        // Optional ping
        const url = process.env.APP_URL;
        if (url && /^https?:\/\//.test(url)) {
            const up = await ping(url);
            if (up) ok(`App URL reachable: ${url}`); else warn(`App URL not reachable: ${url}`);
        } else {
            warn("APP_URL not set to an http(s) URL; skipping reachability check");
        }

        return true;
    }, opts.watch);
}
