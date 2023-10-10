import type { FastifyRedisPluginOptions } from '@fastify/redis';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

/**
 * @package Fastify/redis - Redis connector
 * @see https://github.com/fastify/fastify-redis#readme
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('redis')) return done();

    const baseOpts: FastifyRedisPluginOptions = {
        url: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        closeClient: true,
    };

    fastify.register(import('@fastify/redis'), {
        ...baseOpts,
        namespace: 'user_secret',
    });
    fastify.register(import('@fastify/redis'), {
        ...baseOpts,
        namespace: 'user_token_id',
    });

    done();
}) as FastifyPluginCallback);
