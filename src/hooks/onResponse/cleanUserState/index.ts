import type { FastifyPluginCallback, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    /**
     * Clean fastify token state after each request
     */
    fastify.addHook('onResponse', async (request: Request, reply: Reply) => fastify.jsonWebToken.tokens.cleanState());

    done();
}) as FastifyPluginCallback);
