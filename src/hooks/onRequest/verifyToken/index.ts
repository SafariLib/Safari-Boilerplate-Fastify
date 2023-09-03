import { publicRoutes } from '@utils';
import type {
    FastifyPluginCallback,
    FastifyReply as Reply,
    FastifyRequest as Request,
} from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    fastify.addHook('onRequest', async (request: Request, reply: Reply) => {
        const { jsonWebToken } = fastify;
        const { headers, url, ip } = request;

        // Ignore public routes
        if (publicRoutes.includes(url)) return;

        // Retrieve token from headers
        const { authorization } = headers;
        if (!authorization) reply.code(401).send('AUTH_HEADERS_EMPTY');
        const token = (authorization as string).split(' ')[1];

        try {
            const decoded = jsonWebToken.verifyAccessToken(token);
            jsonWebToken.tokens.access = decoded;
        } catch (e) {
            reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
        }
    });

    done();
}) as FastifyPluginCallback);
