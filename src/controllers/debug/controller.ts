import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'GET',
        url: '/ping',
        handler: async (request: Request, reply: Reply) => {
            const message = `Server is running on ${request.hostname}`;
            reply.code(200).send({ message });
        },
    });

    /*
        --------------------
            Test routes
        --------------------
    */
    fastify.route({
        method: 'POST',
        url: '/test',
        handler: async (request: Request, reply: Reply) => {
            reply.code(200).send({ message: 'Successfull test' });
        },
    });
};
