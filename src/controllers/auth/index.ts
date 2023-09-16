import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { loginSchema, logoutSchema } from './schemas';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'POST',
        url: '/auth/login/admin',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { authService, jsonWebToken } = fastify;
            const { password, username } = request.body;
            try {
                const { user, refreshToken, accessToken } = await authService.logAdmin(username, password);
                reply.code(200).setCookie('refreshToken', refreshToken, jsonWebToken.generateAdminCookieOpts()).send({
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
        url: '/auth/login/user',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { authService, jsonWebToken } = fastify;
            const { password, username } = request.body;
            try {
                const { user, refreshToken, accessToken } = await authService.logUser(username, password);

                reply.code(200).setCookie('refreshToken', refreshToken, jsonWebToken.generateUserCookieOpts()).send({
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
        url: '/auth/logout/admin',
        schema: logoutSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService } = fastify;
            try {
                authService.logoutAdmin();
                reply.code(200).clearCookie('refreshToken').send();
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/logout/user',
        schema: logoutSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService } = fastify;
            try {
                await authService.logoutUser();
                reply.code(200).clearCookie('refreshToken').send();
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/logout/admin/all',
        schema: logoutSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService } = fastify;
            try {
                authService.logoutAllAdmin();
                reply.code(200).clearCookie('refreshToken').send();
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/auth/logout/user/all',
        schema: logoutSchema,
        handler: async (request: Request, reply: Reply) => {
            const { authService } = fastify;
            try {
                await authService.logoutAllUser();
                reply.code(200).clearCookie('refreshToken').send();
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });
};
