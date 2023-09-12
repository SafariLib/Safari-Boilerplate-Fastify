import { publicRoutes } from '@utils';
import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    fastify.addHook('onRequest', async (request: Request, reply: Reply) => {
        const { getAccessToken, verifyAccessToken, tokens } = fastify.jsonWebToken;
        const { url } = request;

        // Ignore public routes
        if (publicRoutes.includes(url)) return;

        try {
            const token = getAccessToken(request);
            const decoded = verifyAccessToken(token);
            tokens.access = decoded;
        } catch (e) {
            reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
        }
    });

    done();
}) as FastifyPluginCallback);
