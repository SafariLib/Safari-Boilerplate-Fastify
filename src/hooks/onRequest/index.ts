import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, _, done) => {
    const { unauthorized } = fastify.errorService;
    const { isRefreshRoute } = fastify.requestService;
    const { getUserSecret, deleteUserToken} = fastify.cacheService;
    const { tokens, getAccessToken, verifyAccessToken } = fastify.jsonWebToken

    // Verify access token
    fastify.addHook('onRequest', async (request: Request, _: Reply) => {
        tokens.cleanState();
        if (isRefreshRoute()) return;

        const token = getAccessToken(request);
        const secret = await getUserSecret(token);

        if (secret) return tokens.access = verifyAccessToken(token, secret)
        
        await deleteUserToken(token)
        unauthorized('AUTH_TOKEN_REVOKED');
    });

    done();
}) as FastifyPluginCallback);
