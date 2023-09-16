import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

/**
 * @package @fastify/swagger
 * @see https://github.com/fastify/fastify-swagger
 * @see https://github.com/fastify/fastify-swagger-ui
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('swagger')) return done();

    fastify.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'Safari API',
                version: '3',
            },
            host: 'localhost',
            schemes: ['http'],
            consumes: ['application/json', 'multipart/form-data'],
            produces: ['application/json'],
        },
    });

    fastify.register(fastifySwaggerUi, {
        routePrefix: '/swagger',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
            tryItOutEnabled: false,
        },
    });

    done();
}) as FastifyPluginCallback);
