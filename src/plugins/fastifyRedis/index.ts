import { FastifyRedisPluginOptions } from '@fastify/redis';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

// declare module 'fastify' {
//     interface FastifyInstance {
//         redis: PrismaClient;
//     }
// }

/**
 * @package PrismaClient
 * @see https://github.com/fastify/fastify-redis#readme
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('redis')) return done();

    const baseOpts: FastifyRedisPluginOptions = {
        url: process.env.REDIS_URL,
        port: Number(process.env.REDIS_PORT),
    };

    fastify.register(import('@fastify/redis'), {
        ...baseOpts,
        namespace: 'user_secret',
    });
    fastify.register(import('@fastify/redis'), {
        ...baseOpts,
        namespace: 'customer_secret',
    });
    fastify.register(import('@fastify/redis'), {
        ...baseOpts,
        namespace: 'user_token_blacklist',
    });
    fastify.register(import('@fastify/redis'), {
        ...baseOpts,
        namespace: 'customer_token_blacklist',
    });

    done();
}) as FastifyPluginCallback);
