import type { FastifyRedisPluginOptions } from '@fastify/redis';
import fastifyRedis from '@fastify/redis';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface RedisPluginOpts {
    options: FastifyRedisPluginOptions;
    namespaces: Array<string>;
}

/**
 * Fastify/redis
 * @see https://github.com/fastify/fastify-redis#readme
 */
export default plugin((async (fastify, opts: RedisPluginOpts, done) => {
    const baseOpts = opts.options;
    for (const namespace of opts.namespaces) await fastify.register(fastifyRedis, { ...baseOpts, namespace });

    done();
}) as FastifyPluginCallback);
