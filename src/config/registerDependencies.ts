import type { FastifyInstance } from 'fastify';
import { serverConfig } from './serverConfig';

/**
 * Register all external dependencies.
 * @config ./src/serverConfig.ts
 */
export const registerDependencies = async (fastify: FastifyInstance) => {
    await fastify.register(import('@dependencies/prisma'), serverConfig.prisma);
    await fastify.register(import('@dependencies/fastifyRedis'), serverConfig.redis);
    await fastify.register(import('@dependencies/fastifyCookie'), serverConfig.cookie);
    await fastify.register(import('@dependencies/fastifyRateLimit'), serverConfig.rateLimit);
    await fastify.register(import('@dependencies/fastifySwagger'), serverConfig.swagger);
    await fastify.register(import('@dependencies/fastifySwaggerUI'), serverConfig.swaggerUI);
    await fastify.register(import('@dependencies/bcrypt'));
    await fastify.register(import('@dependencies/jsonwebtoken'));
};
