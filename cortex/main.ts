// cortex/main.ts
//
// Entry point for the CodexSun CLI.
// Runs through the central CLI router (cortex/cli/index.ts).
// ESM-safe: no require(), no require.main checks.

import "dotenv/config";            // auto-load .env variables
import { runCli } from "./cli";

async function main() {
    try {
        await runCli(process.argv);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.stack || err.message);
        } else {
            console.error(String(err));
        }
        process.exit(1);
    }
}

// kick it off
void main();
