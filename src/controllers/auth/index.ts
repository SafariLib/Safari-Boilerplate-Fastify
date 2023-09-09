import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { loginSchema } from './schemas';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'POST',
        url: '/auth/login/user',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { authService, jsonWebToken } = fastify;
            const { headers, ip } = request;
            const { password, username } = request.body;
            const userAgent = headers['user-agent'];

            try {
                const { user, refreshToken, accessToken } = await authService.logUser(
                    username,
                    password,
                    ip,
                    userAgent,
                );
                reply.code(200).setCookie('refreshToken', refreshToken, jsonWebToken.cookieOpts).send({
                    user,
                    accessToken,
                });
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });

    fastify.route({
        method: 'POST',
        url: '/auth/login/customer',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { authService, jsonWebToken } = fastify;
            const { headers, ip } = request;
            const { password, username } = request.body;
            const userAgent = headers['user-agent'];

            try {
                const { user, refreshToken, accessToken } = await authService.logCustomer(
                    username,
                    password,
                    ip,
                    userAgent,
                );

                reply.code(200).setCookie('refreshToken', refreshToken, jsonWebToken.cookieOpts).send({
                    user,
                    accessToken,
                });
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/logout/user',
        handler: async (request: Request, reply: Reply) => {},
    });
};
