// server.ts
import "dotenv/config";
import { createServer } from "http";
import { AddressInfo } from "net";

// Example logger – replace with your own logging util
const logger = {
    info: console.log.bind(console, "[INFO]"),
    error: console.error.bind(console, "[ERROR]"),
};

async function runHttp() {
    const server = createServer((_req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("OK\n");
    });

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;

    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, () => resolve());
    });

    const addr = server.address() as AddressInfo;
    logger.info(`HTTP server listening on http://localhost:${addr.port}`);
}

(async () => {
    try {
        const mode = process.argv[2];
        if (mode === "cli") {
            // Run the CLI: node dist/server.js cli <...args>
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
