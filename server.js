import { createServer, discoverApps } from "./cortex/main";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
export async function run() {
    const server = await createServer();
    const port = Number(process.env.PORT || 3000);
    await server.listen({ port, host: "0.0.0.0" });
    const apps = discoverApps();
    // Cast to any to silence over-narrowed logger type in some IDE setups
    const log = server.log;
    log.info?.(`codexsun root server running on http://localhost:${port}`);
    log.info?.(`Apps discovered: ${apps.join(", ") || "(none yet)"}`);
    if (apps.length)
        log.info?.(`Try: http://localhost:${port}/${apps[0]}`);
    return server;
}
// Windows-safe "run directly" guard
const isDirect = import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href;
if (isDirect) {
    run().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
