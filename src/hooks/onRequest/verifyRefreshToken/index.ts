import { isAdminRefreshRoute, isUserRefreshRoute } from '@utils';
import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    fastify.addHook('onRequest', async (request: Request, reply: Reply) => {
        const { cacheService, jsonWebToken } = fastify;
        const { url } = request;

        try {
            if (isAdminRefreshRoute(url)) {
                const token = jsonWebToken.getRefreshToken(request);
                const secret = await cacheService.getAdminSecret(token);
                if (!secret) throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };
                jsonWebToken.tokens.refresh = {
                    entity: 'ADMIN',
                    content: jsonWebToken.verifyAdminRefreshToken(token, secret),
                    token,
                };
            }
            if (isUserRefreshRoute(url)) {
                const token = jsonWebToken.getRefreshToken(request);
                const secret = await cacheService.getUserSecret(token);
                if (!secret) throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };
                jsonWebToken.tokens.refresh = {
                    entity: 'USER',
                    content: jsonWebToken.verifyUserRefreshToken(token, secret),
                    token,
                };
            }
        } catch (e) {
            reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
        }
    });

    done();
}) as FastifyPluginCallback);
