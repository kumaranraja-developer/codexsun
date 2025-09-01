// apps/user.controller.ts
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { UserRepo, UserCreateInput, UserUpdateInput } from "./user.repo";

const userController: FastifyPluginAsync = async (fastify: FastifyInstance) => {




    fastify.get("/", async (req) => {
        const { q, active, limit, offset } = req.query as {
            q?: string;
            active?: string;
            limit?: string;
            offset?: string;
        };

        return UserRepo.search({
            q,
            active: active === undefined ? undefined : active === "true",
            limit: limit ? Number(limit) : 50,
            offset: offset ? Number(offset) : 0,
        });
    });



    // Count users
    fastify.get("/count", async () => {
        const count = await UserRepo.count();
        return { count };
    });

    // Get user by ID
    fastify.get("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const user = await UserRepo.findById(Number(id));
        if (!user) return reply.code(404).send({ error: "User not found" });
        return user;
    });

    // Create user
    fastify.post("/", async (req, reply) => {
        const body = req.body as UserCreateInput;
        if (!body.slug || !body.name) {
            return reply.code(400).send({ error: "slug and name are required" });
        }
        const user = await UserRepo.create(body);
        return reply.code(201).send(user);
    });

    // Update user
    fastify.put("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as UserUpdateInput;
        const user = await UserRepo.update(Number(id), body);
        if (!user) return reply.code(404).send({ error: "User not found" });
        return user;
    });

    // Soft delete user
    fastify.delete("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const ok = await UserRepo.softDelete(Number(id));
        if (!ok) return reply.code(404).send({ error: "User not found" });
        return { success: true };
    });
};

export default userController;
