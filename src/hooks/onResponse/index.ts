import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, _, done) => {
    const { jsonWebToken, requestService } = fastify;

    // Clean state on response
    fastify.addHook('onResponse', async (request: Request, _: Reply) => {
        jsonWebToken.tokens.cleanState()
        requestService.setUrl(request.url)
    });

    done();
}) as FastifyPluginCallback);
