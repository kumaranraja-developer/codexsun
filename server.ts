// server.ts
import { createServer, discoverApps } from "./cortex/main";
import { logger } from "./cortex/utils/logger";

async function runHttp() {
    const server = await createServer();
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? "0.0.0.0";

    await server.listen({ port, host });
    const apps = discoverApps();

    logger.info(`codexsun root server running on http://${host}:${port}`);
    logger.info(`Apps discovered: ${apps.join(", ") || "(none)"}`);
}

(async () => {
    try {
        const mode = process.argv[2];
        if (mode === "cli") {
            // your cli entry can also import { logger } and use it
            const { runCli } = await import("./cortex/cli/index");
            await runCli(process.argv.slice(3));
        } else {
            await runHttp();
        }
    } catch (err: any) {
        logger.error("Fatal error on startup", { err });
        process.exit(1);
    }
})();
