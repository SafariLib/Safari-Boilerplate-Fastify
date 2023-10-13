import type { CookieSerializeOptions } from '@fastify/cookie';
import fastifyCookie from '@fastify/cookie';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface FastifyCookiePluginOpts {
    secret: string;
    serializeOpts: CookieSerializeOptions;
}

/**
 * @fastify/cookie
 * @see https://github.com/fastify/fastify-cookie
 */
export default plugin((async (fastify, opts: FastifyCookiePluginOpts, done) => {
    await fastify.register(fastifyCookie, {
        secret: opts.secret,
    });

    const cookieSerializeOpts: CookieSerializeOptions = opts.serializeOpts;

    fastify.decorate('cookieSerializeOpts', cookieSerializeOpts);

    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        cookieSerializeOpts: CookieSerializeOptions;
    }
}
