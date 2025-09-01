// server.ts
import Fastify from "fastify";
import "dotenv/config";
import { formatServerLog, ServerLogger } from "./cortex/utils/server-logger";
import { getAppHost, getAppPort } from "./cortex/settings/get_settings";
import { registerApps } from "./cortex/main";

const HOST = getAppHost();
const PORT = getAppPort();

async function startServer() {
    const fastify = Fastify({
        logger: {
            stream: {
                write(msg: string) {
                    try {
                        const log = JSON.parse(msg);
                        console.log(formatServerLog(log));
                    } catch {
                        console.log(msg.trim());
                    }
                },
            },
        },
    });

    // Register all Cortex apps
    await registerApps(fastify);

    fastify.get("/", async () => ({ message: "Welcome to Codexsun!" }));

    try {
        await fastify.listen({ port: PORT, host: HOST });
        ServerLogger(`🚀 Server running on http://${HOST}:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

startServer();
