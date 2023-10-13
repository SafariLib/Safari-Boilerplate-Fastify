import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export type APIErrorCode =
    | 'ORDERBY_MALFORMED'
    | 'PAGINATION_MALFORMED'
    | 'FILTER_MALFORMED_DATE'
    | 'ENTITY_NOT_FOUND'
    | 'ACCESS_DENIED'
    | 'AUTH_INVALID_CREDENTIALS'
    | 'AUTH_TOO_MANY_ATTEMPTS'
    | 'AUTH_USER_REVOKED'
    | 'AUTH_HEADERS_EMPTY'
    | 'AUTH_COOKIE_EMPTY'
    | 'AUTH_COOKIE_INVALID'
    | 'AUTH_TOKEN_EXPIRED'
    | 'AUTH_TOKEN_REVOKED'
    | 'AUTH_TOKEN_INVALID';

export type ThrowAPIError = (message: APIErrorCode) => never;

export interface ErrorHandlers {
    notFound: ThrowAPIError;
    unauthorized: ThrowAPIError;
    forbidden: ThrowAPIError;
    badRequest: ThrowAPIError;
    conflict: ThrowAPIError;
    internalServerError: ThrowAPIError;
    serviceUnavailable: ThrowAPIError;
    tooManyRequests: ThrowAPIError;
}

export default plugin((async (fastify, _, done) => {
    const errorHandlers: ErrorHandlers = {
        notFound: message => {
            throw { statusCode: 404, message };
        },

        unauthorized: message => {
            throw { statusCode: 401, message };
        },

        forbidden: message => {
            throw { statusCode: 403, message };
        },

        badRequest: message => {
            throw { statusCode: 400, message };
        },

        conflict: message => {
            throw { statusCode: 409, message };
        },

        internalServerError: message => {
            throw { statusCode: 500, message };
        },

        serviceUnavailable: message => {
            throw { statusCode: 503, message };
        },

        tooManyRequests: message => {
            throw { statusCode: 429, message };
        },
    };

    Object.keys(errorHandlers).forEach(key => {
        if (!fastify.hasDecorator(key)) fastify.decorate(key, errorHandlers[key as keyof ErrorHandlers]);
        if (!fastify.hasReplyDecorator(key)) fastify.decorateReply(key, errorHandlers[key as keyof ErrorHandlers]);
    });

    fastify.setErrorHandler((error, _, reply) => {
        const { statusCode, message } = error;
        reply.code(statusCode).send({ message });
    });

    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance extends ErrorHandlers {}
    interface FastifyReply extends ErrorHandlers {}
}
