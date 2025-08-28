// root/cortex/cli/doctor/providers.ts
import { runOrWatch, ok, warn, sep } from "./_runner";

export async function runDoctorProviders(opts: { watch?: boolean }) {
    await runOrWatch("providers", async () => {
        sep("Providers Doctor");

        // Example: generic API key/provider checks
        const providers = [
            { key: "API_KEY", label: "Primary API" },
            // add more here: { key: "S3_BUCKET", label: "S3" }, etc.
        ];

        let healthy = true;
        for (const p of providers) {
            if (!process.env[p.key]) {
                warn(`${p.label}: ${p.key} not set`);
                healthy = false; // mark as degraded, not fatal
            } else {
                ok(`${p.label}: configured`);
            }
        }

        return healthy;
    }, opts.watch);
}
