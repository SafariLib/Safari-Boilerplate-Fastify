import type { RateLimitPluginOptions } from '@fastify/rate-limit';
import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export type FastifyRateLimitPluginOpts = RateLimitPluginOptions;

/**
 * @fastify/rate-limit
 * @see https://github.com/fastify/fastify-rate-limit
 * @see https://github.com/fastify/fastify-rate-limit#options-on-the-endpoint-itself
 */
export default plugin((async (fastify, opts: FastifyRateLimitPluginOpts, done) => {
    await fastify.register(fastifyRateLimit, opts);
    done();
}) as FastifyPluginCallback);
