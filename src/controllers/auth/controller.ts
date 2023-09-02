import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { loginSchema } from './schemas';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'POST',
        url: '/auth/login/user',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { verifyUserCredentials, logUserConnection } = fastify.authService;
            const { signAccessToken, signRefreshToken, cookieOpts } = fastify.jsonWebToken;
            const { headers, ip } = request;
            const { password, username } = request.body;
            const userAgent = headers['user-agent'];

            try {
                const { user, tokenContent } = await verifyUserCredentials({ username, password });
                const accessToken = signAccessToken(tokenContent);
                const refreshToken = signRefreshToken(tokenContent);
                await logUserConnection(user.id, ip, userAgent);

                reply
                    .code(200)
                    .setCookie('refreshToken', refreshToken, cookieOpts)
                    .send({
                        user: { ...user, accessToken },
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
            const { verifyCustomerCredentials, logCustomerConnection } = fastify.authService;
            const { signAccessToken, signRefreshToken, cookieOpts } = fastify.jsonWebToken;
            const { headers, ip } = request;
            const { password, username } = request.body;
            const userAgent = headers['user-agent'];

            try {
                const { user, tokenContent } = await verifyCustomerCredentials({ username, password });
                const accessToken = signAccessToken(tokenContent);
                const refreshToken = signRefreshToken(tokenContent);
                await logCustomerConnection(user.id, ip, userAgent);

                reply
                    .code(200)
                    .setCookie('refreshToken', refreshToken, cookieOpts)
                    .send({
                        user: { ...user, accessToken },
                    });
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });
};
