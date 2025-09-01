// cortex/main.ts
import { FastifyInstance } from "fastify";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerApps(fastify: FastifyInstance) {
    const appsDir = path.resolve(__dirname, "../apps");
    const apps = readdirSync(appsDir, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => dir.name);

    for (const appName of apps) {
        const appPath = path.join(appsDir, appName, "app.ts");

        try {
            // ✅ convert absolute path → file:// URL (fixes Windows ESM issue)
            const { registerApp } = await import(pathToFileURL(appPath).href);

            if (typeof registerApp === "function") {
                await registerApp(fastify);
                console.log(`✅ Registered app: ${appName}`);
            }
        } catch (err) {
            console.error(`⚠️ Could not load app ${appName}`, err);
        }
    }
}

