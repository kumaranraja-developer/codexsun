// cortex/types/fastify-augment.d.ts
import "fastify";
import type { Logger } from "../utils/logger";

declare module "fastify" {
    interface FastifyInstance {
        ulog: Logger;
    }
    interface FastifyRequest {
        ulog: Logger;
    }
}
