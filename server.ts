// server.ts
import Fastify, { FastifyInstance } from "fastify";
import "dotenv/config";
import { formatServerLog, ServerLogger } from "./cortex/utils/server-logger";
import { getAppHost, getAppPort } from "./cortex/settings/get_settings";
import { registerApps } from "./cortex/main";

const HOST = getAppHost();
const PORT = getAppPort();

async function startServer() {
    const fastify: FastifyInstance = Fastify({
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

    // ✅ Enable CORS (manual, since @fastify/cors doesn’t support v5 yet)
    fastify.addHook("onRequest", (req, reply, done) => {
        reply.header("Access-Control-Allow-Origin", "*");
        reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
            reply.status(204).send();
            return;
        }

        done();
    });

    // ✅ Register all Cortex apps dynamically
    await registerApps(fastify);

    // ✅ Default root route
    fastify.get("/", async () => ({ message: "Welcome to Codexsun!" }));

    // ✅ Catch-all 404 JSON handler
    fastify.setNotFoundHandler((req, reply) => {
        reply.status(404).send({
            error: "Not Found",
            message: `Route ${req.method} ${req.url} not found`,
            statusCode: 404,
        });
    });

    try {
        await fastify.listen({ port: PORT, host: HOST });
        ServerLogger(`🚀 Server running on http://${HOST}:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

startServer();
