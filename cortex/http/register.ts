// ================================ framework/http/register.ts ================================
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';


/** Helper to register a Fastify plugin with optional prefix */
export async function register(fastify: FastifyInstance, plugin: FastifyPluginAsync<any>, opts?: { prefix?: string }) {
    const { prefix = '' } = opts || {};
    await fastify.register(plugin, { prefix });
}