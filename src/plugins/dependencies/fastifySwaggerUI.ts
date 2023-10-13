import fastifySwaggerUI from '@fastify/swagger-ui';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface FastifySwaggerUIPluginOpts {
    routePrefix: string;
    uiConfig: {
        docExpansion: 'list';
        deepLinking: boolean;
        tryItOutEnabled: boolean;
    };
}

/**
 * @fastify/swagger-ui
 * @see https://github.com/fastify/fastify-swagger-ui
 */
export default plugin((async (fastify, opts: FastifySwaggerUIPluginOpts, done) => {
    await fastify.register(fastifySwaggerUI, opts);

    done();
}) as FastifyPluginCallback);
