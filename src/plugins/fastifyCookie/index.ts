import fastifyCookie from '@fastify/cookie';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

/**
 * @package @fastify/cookie
 * @see https://github.com/fastify/fastify-cookie
 */
export default plugin((async (fastify, opts, done) => {
    fastify.register(fastifyCookie, {
        secret: process.env.SECRET_COOKIE,
        ...opts,
    });

    done();
}) as FastifyPluginCallback);
