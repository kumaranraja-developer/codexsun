import { createServer } from "./cortex/main";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { discoverApps } from "./cortex/main"; // ensure this is exported in main.ts

export async function run() {
    const server = await createServer();
    const port = Number(process.env.PORT || 3000);
    await server.listen({ port, host: "0.0.0.0" });

    const apps = discoverApps();
    const log: any = server.log;
    log.info?.(`codexsun root server running on http://localhost:${port}`);
    log.info?.(`Apps discovered: ${apps.join(", ") || "(none yet)"}`);
    if (apps.length) log.info?.(`Try: http://localhost:${port}/${apps[0]}`);
    return server;
}

const isDirect = import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href;
if (isDirect) {
    run().catch((err) => { console.error(err); process.exit(1); });
}
