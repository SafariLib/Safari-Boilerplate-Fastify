import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { loginSchema } from './schemas';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'POST',
        url: '/auth/login/:entity',
        schema: loginSchema,
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { verifyCredentials, logUserConnection } = fastify.authService;
            const { signAccessToken, signRefreshToken, cookieOpts } = fastify.jsonWebToken;
            const { headers, ip } = request;
            const { entity } = request.params;
            const { password, username } = request.body;
            const userAgent = headers['user-agent'];

            if (!username) return reply.code(400).send({ message: 'USER_NO_USERNAME_PROVIDED' });
            if (!password) return reply.code(400).send({ message: 'USER_NO_PASSWORD_PROVIDED' });
            if (!password && !username) reply.code(400).send({ message: 'BODY_MALFORMED' });

            try {
                const { user, tokenContent } = await verifyCredentials({ username, password }, entity);
                const accessToken = signAccessToken(tokenContent);
                const refreshToken = signRefreshToken(tokenContent);
                await logUserConnection(user.id, ip, userAgent, entity);

                reply
                    .code(200)
                    .setCookie('refreshToken', refreshToken, cookieOpts)
                    .send({
                        user: { ...user, accessToken },
                    });
            } catch (e) {
                reply.code(e?.status ?? 500).send(e);
            }
        },
    });
};
