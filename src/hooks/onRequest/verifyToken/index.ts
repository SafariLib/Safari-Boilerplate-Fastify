import { publicRoutes } from '@utils';
import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    fastify.addHook('onRequest', async (request: Request, reply: Reply) => {
        const { cacheService, jsonWebToken } = fastify;
        const { url } = request;

        // Ignore public routes
        if (publicRoutes.includes(url)) return;

        try {
            const tokenString = jsonWebToken.getAccessToken(request);

            if (await cacheService.getUserTokenBlacklist(tokenString))
                throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };

            const decoded = jsonWebToken.verifyAccessToken(tokenString);
            jsonWebToken.tokens.access = decoded;
        } catch (e) {
            reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
        }
    });

    done();
}) as FastifyPluginCallback);
