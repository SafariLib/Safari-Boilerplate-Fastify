import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    fastify.addHook('onResponse', async (request: Request, reply: Reply) => {
        const { refresh, access } = fastify.jsonWebToken.tokens;
        refresh.token = null;
        refresh.content = null;
        refresh.entity = null;
        access.token = null;
        access.content = null;
        access.entity = null;
    });

    done();
}) as FastifyPluginCallback);
