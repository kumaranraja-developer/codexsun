// cortex/create.ts
import Fastify, { FastifyInstance } from "fastify";
import { logger } from "../utils/log_cx";

export function createFastify(): FastifyInstance {
    const app = Fastify({
        logger: false,
        trustProxy: true,
        disableRequestLogging: true,
    });

    // attach our custom logger on the instance
    app.decorate("ulog", logger);

    // add a request-scoped child logger → req.ulog
    app.addHook("onRequest", async (req) => {
        const reqId = (req.id as any) ?? Math.random().toString(36).slice(2);
        (req as any).ulog = app.ulog.child({ reqId, method: req.method, url: req.url });
        (req as any)._startAt = process.hrtime.bigint();
    });

    app.addHook("onResponse", async (req, reply) => {
        const start = (req as any)._startAt as bigint | undefined;
        const ms = start ? Number((process.hrtime.bigint() - start) / 1_000_000n) : undefined;
        const rlog = (req as any).ulog ?? app.ulog;
        rlog.info(`→ ${reply.statusCode}${ms !== undefined ? ` ${ms}ms` : ""}`, {
            status: reply.statusCode,
            ms,
        });
    });

    app.setErrorHandler((err, req, reply) => {
        const rlog = (req as any).ulog ?? app.ulog;
        rlog.error(`Unhandled error: ${err.message}`, { err });
        reply.status(err.statusCode ?? 500).send({ ok: false, error: "Internal error" });
    });

    return app;
}
