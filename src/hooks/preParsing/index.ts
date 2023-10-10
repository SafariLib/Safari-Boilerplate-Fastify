import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, _, done) => {
    const { setUrl } = fastify.requestService;

    // Add url to requestService
    fastify.addHook('preParsing', async (request: Request, _: Reply) => setUrl(request.url));    

    done();
}) as FastifyPluginCallback);
