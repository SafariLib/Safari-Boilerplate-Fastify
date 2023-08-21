import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

/**
 * @package @fastify/rate-limit
 * @see https://github.com/fastify/fastify-rate-limit
 * @see https://github.com/fastify/fastify-rate-limit#options-on-the-endpoint-itself
 */
export default plugin((async (fastify, opts, done) => {
    fastify.register(fastifyRateLimit, {
        global: true, // Apply to all routes
        max: 100, // Maximum requests allowed
        timeWindow: 60000, // Time window in milliseconds
        hook: 'onRequest', // First hook in the request lifecycle
    });

    done();
}) as FastifyPluginCallback);
