import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import serverConfig from './serverConfig';

/**
 * Register all external dependencies.
 * @config ./src/serverConfig.ts
 */
export default plugin((async (fastify, _, done) => {
    await fastify.register(import('@dependencies/prisma'), serverConfig.prisma);
    await fastify.register(import('@dependencies/bcrypt'), serverConfig.bcrypt);
    await fastify.register(import('@dependencies/fastifyRedis'), serverConfig.redis);
    await fastify.register(import('@dependencies/fastifyCookie'), serverConfig.cookie);
    await fastify.register(import('@dependencies/fastifyRateLimit'), serverConfig.rateLimit);
    await fastify.register(import('@dependencies/fastifySwagger'), serverConfig.swagger);
    await fastify.register(import('@dependencies/fastifySwaggerUI'), serverConfig.swaggerUI);
    await fastify.register(import('@dependencies/jsonwebtoken'), serverConfig.jsonwebtoken);
    done();
}) as FastifyPluginCallback);
