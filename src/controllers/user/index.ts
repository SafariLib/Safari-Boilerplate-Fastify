import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { adminPrefix } from '../../utils';
import { getUserById, getUsers } from './schemas';
import { GetPaginatedUsersPayload, GetUserByIdPayload } from './types';

export default async (fastify: FastifyInstance) => {
    fastify.route({
        method: 'GET',
        url: `${adminPrefix}/user`,
        schema: getUsers,
        handler: async (request: Request<GetPaginatedUsersPayload>, reply: Reply) => {
            const { userService } = fastify;
            const { page, limit, ...query } = request.query;
            try {
                const users = await userService.getPaginatedUsers(page ?? 0, limit ?? 10, query);
                reply.code(200).send(users);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: `${adminPrefix}/admin`,
        schema: getUsers,
        handler: async (request: Request<GetPaginatedUsersPayload>, reply: Reply) => {
            const { userService } = fastify;
            const { page, limit, ...query } = request.query;
            try {
                const admins = await userService.getPaginatedAdmins(page ?? 0, limit ?? 10, query);
                reply.code(200).send(admins);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: `${adminPrefix}/user/:id`,
        schema: getUserById,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { userService } = fastify;
            const { id } = request.params;
            try {
                const user = await userService.getUserById(Number(id));
                reply.code(200).send(user);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: `${adminPrefix}/admin/:id`,
        schema: getUserById,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { userService } = fastify;
            const { id } = request.params;
            try {
                const admin = await userService.getAdminById(Number(id));
                reply.code(200).send(admin);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });
};
