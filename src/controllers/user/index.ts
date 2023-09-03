import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { getUserById, getUsers } from './schemas';
import { GetUserByIdPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'GET',
        url: '/user',
        schema: getUsers,
        handler: async (request: Request, reply: Reply) => {
            const { prisma } = fastify;
            try {
                const users = await prisma.user.findMany({
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        avatar_url: true,
                        revoked: true,
                        created_at: true,
                        updated_at: true,
                    },
                });

                reply.code(200).send(users);
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: '/user/:id',
        schema: getUserById,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { prisma } = fastify;
            const { id } = request.params;
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        id: Number(id),
                    },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        avatar_url: true,
                        revoked: true,
                        created_at: true,
                        updated_at: true,
                    },
                });

                reply.code(200).send(user);
            } catch (e) {
                reply.code(e?.status ?? 500).send(e?.errorCode ?? e);
            }
        },
    });
};