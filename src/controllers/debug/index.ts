import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { adminPrefix, userPrefix } from '../../utils';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'GET',
        url: '/ping',
        handler: async (request: Request, reply: Reply) => {
            const message = `Server is running on ${request.hostname}`;
            reply.code(200).send({ message });
        },
    });

    fastify.route({
        method: 'GET',
        url: `${userPrefix}/ping`,
        handler: async (request: Request, reply: Reply) => {
            const message = `Server is running on ${request.hostname} (You've reached an authenticated route btw)`;
            reply.code(200).send({ message });
        },
    });

    fastify.route({
        method: 'GET',
        url: `${adminPrefix}/ping`,
        handler: async (request: Request, reply: Reply) => {
            const message = `Server is running on ${request.hostname} (You've reached an admin authenticated route btw)`;
            reply.code(200).send({ message });
        },
    });
};
