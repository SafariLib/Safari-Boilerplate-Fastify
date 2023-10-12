import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { ErrorService, ThrowAPIError } from './types';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('errorService')) return done();

    const notFound: ThrowAPIError = message => {
        throw { statusCode: 404, message };
    };

    const unauthorized: ThrowAPIError = message => {
        throw { statusCode: 401, message };
    };

    const forbidden: ThrowAPIError = message => {
        throw { statusCode: 403, message };
    };

    const badRequest: ThrowAPIError = message => {
        throw { statusCode: 400, message };
    };

    const conflict: ThrowAPIError = message => {
        throw { statusCode: 409, message };
    };

    const internalServerError: ThrowAPIError = message => {
        throw { statusCode: 500, message };
    };

    const serviceUnavailable: ThrowAPIError = message => {
        throw { statusCode: 503, message };
    };

    const tooManyRequests: ThrowAPIError = message => {
        throw { statusCode: 429, message };
    };

    fastify.decorate('errorService', {
        notFound,
        unauthorized,
        forbidden,
        badRequest,
        conflict,
        internalServerError,
        serviceUnavailable,
        tooManyRequests,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        errorService: ErrorService;
    }
}
