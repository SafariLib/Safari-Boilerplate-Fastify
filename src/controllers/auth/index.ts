import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import type { LoginPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'POST',
        url: '/auth/login-user',
        // TODO: create schema schema => fastify.getSchema('/login'),
        handler: async (request: Request<LoginPayload>, reply: Reply) => {
            const { verifyCredentials, logUserConnection } = fastify.authService;
            const { signAccessToken, signRefreshToken, cookieOpts } = fastify.jsonWebToken;
            const { headers, ip } = request;
            const { password, username } = request.body;

            if (!username) return reply.code(400).send({ message: 'USER_NO_USERNAME_PROVIDED' });
            if (!password) return reply.code(400).send({ message: 'USER_NO_PASSWORD_PROVIDED' });
            if (!password && !username) reply.code(400).send({ message: 'BODY_MALFORMED' });

            const userAgent = headers['user-agent'];

            try {
                const { user, tokenContent } = await verifyCredentials({ username, password }, 'user');
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
                reply.code(401).send(e);
            }
        },
    });
};
