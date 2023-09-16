import { isAdminLogoutRoute, isAdminProtectedRoute, isUserLogoutRoute, isUserProtectedRoute } from '@utils';
import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    fastify.addHook('onRequest', async (request: Request, reply: Reply) => {
        const { cacheService, jsonWebToken } = fastify;
        const { url } = request;

        try {
            if (isAdminProtectedRoute(url) || isAdminLogoutRoute(url)) {
                const token = jsonWebToken.getAccessToken(request);
                const secret = await cacheService.getAdminSecret(token);
                if (!secret) throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };
                jsonWebToken.tokens.access = {
                    entity: 'ADMIN',
                    content: jsonWebToken.verifyAdminAccessToken(token, secret),
                    token,
                };
            }
            if (isUserProtectedRoute(url) || isUserLogoutRoute(url)) {
                const token = jsonWebToken.getAccessToken(request);
                const secret = await cacheService.getUserSecret(token);
                if (!secret) throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };
                jsonWebToken.tokens.access = {
                    entity: 'USER',
                    content: jsonWebToken.verifyUserAccessToken(token, secret),
                    token,
                };
            }
        } catch (e) {
            reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
        }
    });

    done();
}) as FastifyPluginCallback);
