import { refreshTokenName } from '@plugins/jsonWebToken/utils';
import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { loginSchema, logoutSchema, refreshSchema } from './schemas';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    const { generateCookieOpts } = fastify.jsonWebToken;
    const { login, logout, logoutAll, refreshTokens, verifyRefreshToken, getUserIp } = fastify.authService;

    fastify.route({
        method: 'POST',
        url: '/auth/login',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { password, username } = request.body;
            const userClient = getUserIp(request);

            try {
                const { user, refreshToken, accessToken } = await login(username, password, userClient);
                reply.code(200).setCookie(refreshTokenName, refreshToken, generateCookieOpts()).send({
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
            try {
                await logout();
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
            try {
                await logoutAll();
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
            try {
                await verifyRefreshToken(request);
                const { user, refreshToken, accessToken } = await refreshTokens();
                reply.code(200).setCookie(refreshTokenName, refreshToken, generateCookieOpts()).send({
                    user,
                    accessToken,
                });
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });
};
