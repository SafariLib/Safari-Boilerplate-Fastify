import fastifySwagger from '@fastify/swagger';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface FastifySwaggerPluginOpts {
    info: {
        title: string;
        version: string;
    };
    host: string;
    schemes: Array<string>;
    consumes: Array<string>;
    produces: Array<string>;
}

/**
 * @fastify/swagger
 * @see https://github.com/fastify/fastify-swagger
 */
export default plugin((async (fastify, opts: FastifySwaggerPluginOpts, done) => {
    await fastify.register(fastifySwagger, {
        swagger: opts,
    });
    done();
}) as FastifyPluginCallback);
