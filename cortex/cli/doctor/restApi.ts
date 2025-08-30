// cortex/cli/doctor/restApi.ts
import http from "node:http";
import https from "node:https";
import { loadEnvAndSettings } from "./settings.js";

const log = {
    ok:   (m: string) => console.log(`✅ ${m}`),
    warn: (m: string) => console.warn(`⚠️  ${m}`),
    sep:  (t: string) => console.log(`\n—— ${t} ——`),
};

function ping(url: string, timeoutMs = 1500): Promise<{ ok: boolean; code?: number }> {
    return new Promise((resolve) => {
        try {
            const mod = url.startsWith("https:") ? https : http;
            const req = mod.request(url, { method: "GET", timeout: timeoutMs }, (res) => {
                res.resume();
                resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 400, code: res.statusCode ?? 0 });
            });
            req.on("timeout", () => { req.destroy(); resolve({ ok: false }); });
            req.on("error", () => resolve({ ok: false }));
            req.end();
        } catch {
            resolve({ ok: false });
        }
    });
}

export async function apiDoctor() {
    log.sep("REST API Doctor");
    const settings = await loadEnvAndSettings();
    const base = process.env.APP_URL || settings?.APP_URL || "http://localhost:3000";
    const url = base.replace(/\/+$/, "") + "/healthz";
    const res = await ping(url);
    if (res.ok) log.ok(`Healthz OK (${url}${res.code ? ` → ${res.code}` : ""})`);
    else log.warn(`Healthz not reachable (${url}${res.code ? ` → ${res.code}` : ""})`);
}
