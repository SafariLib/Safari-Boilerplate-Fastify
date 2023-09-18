import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

/**
 * @package @fastify/rate-limit
 * @see https://github.com/fastify/fastify-rate-limit
 * @see https://github.com/fastify/fastify-rate-limit#options-on-the-endpoint-itself
 * Requests are limited to 100 per second on default settings
 *  - This can be overridden on a per-route basis using config objects on endpoint declaration
 *  - This is based on the IP address of the request
 */
export default plugin((async (fastify, opts, done) => {
    fastify.register(fastifyRateLimit, {
        global: true, // Apply to all routes
        max: 100, // Maximum requests allowed
        timeWindow: 1000, // Time window in milliseconds
        hook: 'onRequest', // First hook in the request lifecycle
    });

    done();
}) as FastifyPluginCallback);
