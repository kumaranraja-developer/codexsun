// cortex/cli/index.ts
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const APPS_DIR = join(process.cwd(), "apps");

export async function runCli(args: string[]) {
    const [appName, ...rest] = args;

    // no app specified -> list apps and help
    if (!appName) {
        const apps = listApps();
        console.log("Codexsun CLI");
        console.log("Usage: pnpm cli <appName> [...args]");
        console.log("Apps:", apps.length ? apps.join(", ") : "(none)");
        return;
    }

    // dispatch to that app's CLI
    const cliPath = join(APPS_DIR, appName, "cli", "index.ts");
    try {
        const mod = await import(pathToFileURL(cliPath).href);
        if (typeof mod.default !== "function") {
            throw new Error(`App CLI must export default function: ${cliPath}`);
        }
        await mod.default(rest);
    } catch (err) {
        console.error(`Error running CLI for app "${appName}":`, err);
        process.exitCode = 1;
    }
}

function listApps(): string[] {
    try {
        return readdirSync(APPS_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .sort();
    } catch {
        return [];
    }
}
