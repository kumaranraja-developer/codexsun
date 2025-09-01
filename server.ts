// server.ts
import "dotenv/config";
import { AddressInfo } from "net";

(async () => {
    try {
        const mode = process.argv[2];
        if (mode === "cli") {
            const { runCli } = await import("./cortex/cli/index");
            await runCli(process.argv.slice(3));
            return;
        }

        const { bootApp } = await import("./cortex/main");
        const app = await bootApp();

        const port = Number(process.env.PORT || 3000);
        const host = process.env.HOST || "127.0.0.1";
        await app.listen({ port, host });

        // const addr = app.server.address() as AddressInfo;
        // app.log.info(`Server listening at http://${host}:${addr.port}`);
    } catch (err) {
        console.error("[ERROR] Fatal startup error", err);
        process.exit(1);
    }
})();
