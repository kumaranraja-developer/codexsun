// apps/cxsun/src/user/user.api.ts

import {FastifyPluginCallback} from "fastify";
import {UserController} from "./user.controller";
import {aRequest} from "../../../../../cortex/core/controller";

const registerUserApi: FastifyPluginCallback<{ prefix?: string }> = (app, _opts, done) => {
    const ctrl = new UserController();
    const base = "/users";

    // Public (read-only)
    app.get(base, async (req, reply) => {
        const res = await ctrl.Index(aRequest.fromFastify(req));
        reply.send(res);
    });

    app.get(`${base}/count`, async (req, reply) => {
        const res = await ctrl.Count(aRequest.fromFastify(req));
        reply.send(res);
    });

    app.get(`${base}/nextno`, async (req, reply) => {
        const res = await ctrl.NextNo(aRequest.fromFastify(req));
        reply.send(res);
    });

    app.get(`${base}/:id`, async (req, reply) => {
        const res = await ctrl.Show(aRequest.fromFastify(req));
        reply.send(res);
    });

    // Protected (example: add your auth preHandler here if you have one)
    app.post(
        base,
        /* { preHandler: [authMiddleware] } */ async (req, reply) => {
            const res = await ctrl.Store(aRequest.fromFastify(req));
            reply.send(res);
        }
    );

    app.put(
        `${base}/:id`,
        /* { preHandler: [authMiddleware] } */ async (req, reply) => {
            const res = await ctrl.Update(aRequest.fromFastify(req));
            reply.send(res);
        }
    );

    app.delete(
        `${base}/:id`,
        /* { preHandler: [authMiddleware] } */ async (req, reply) => {
            const res = await ctrl.Delete(aRequest.fromFastify(req));
            reply.send(res);
        }
    );

    done();
};

export default registerUserApi;
export {registerUserApi};
