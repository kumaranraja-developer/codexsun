#!/usr/bin/env node
// root/main.ts
// Minimal launcher that defers to ./index.ts

(async () => {
    // Try ESM default export first: export async function runCli(argv?: string[])
    try {
        const mod = await import("./cli/index");
        if (typeof (mod as any).runCli === "function") {
            await (mod as any).runCli(process.argv);
            return;
        }
        if (typeof (mod as any).default === "function") {
            await (mod as any).default(process.argv);
            return;
        }
        throw new Error("index.ts does not export runCli or a default handler");
    } catch (err: any) {
        // If your build emits CommonJS for index.js, fall back to require()
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require("./cli/index");
            const handler =
                typeof mod.runCli === "function" ? mod.runCli :
                    typeof mod.default === "function" ? mod.default :
                        null;

            if (!handler) throw new Error("index.js does not export runCli or default");
            await handler(process.argv);
        } catch (e) {
            const msg = (err?.stack || err?.message || String(err)) +
                "\n" +
                ((e as any)?.stack || (e as any)?.message || "");
            console.error(msg);
            process.exit(1);
        }
    }
})();
