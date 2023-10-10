import { refreshTokenName } from '@plugins/jsonWebToken/utils';
import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { loginSchema, logoutSchema, refreshSchema } from './schemas';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    const { authService, jsonWebToken } = fastify;

    fastify.route({
        method: 'POST',
        url: '/auth/login',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { password, username } = request.body;
            const userClient = authService.getUserIp(request);

            try {
                const { user, refreshToken, accessToken } = await authService.login(username, password, userClient);
                reply.code(200).setCookie(refreshTokenName, refreshToken, jsonWebToken.generateCookieOpts()).send({
                    user,
                    accessToken,
                });
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/logout',
        schema: logoutSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService } = fastify;
            try {
                await authService.logout();
                reply.code(200).clearCookie(refreshTokenName).send();
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/logout/all',
        schema: logoutSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService } = fastify;
            try {
                await authService.logoutAll();
                reply.code(200).clearCookie(refreshTokenName).send();
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/refresh',
        schema: refreshSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService, jsonWebToken } = fastify;
            try {
                await authService.verifyRefreshToken(request);
                const { user, refreshToken, accessToken } = await authService.refreshTokens();
                reply.code(200).setCookie(refreshTokenName, refreshToken, jsonWebToken.generateCookieOpts()).send({
                    user,
                    accessToken,
                });
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });
};
