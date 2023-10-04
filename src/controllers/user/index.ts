import { AccessRights } from '@services/auth/types';
import { adminPrefix } from '@utils';
import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import { activateUser, getUserById, getUsers, revokeUser } from './schemas';
import type { GetPaginatedUsersPayload, GetUserByIdPayload } from './types';

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

    fastify.route({
        method: 'PUT',
        url: `${adminPrefix}/user/:id/revoke`,
        schema: revokeUser,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { revokeUser, checkAdminAccessRights } = fastify.authService;
            const { id } = request.params;
            checkAdminAccessRights([AccessRights.RevokeUser]);

            try {
                await revokeUser(Number(id));
                reply.code(200).send();
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'PUT',
        url: `${adminPrefix}/user/:id/activate`,
        schema: activateUser,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { activateUser, checkAdminAccessRights } = fastify.authService;
            const { id } = request.params;
            checkAdminAccessRights([AccessRights.RevokeUser]);

            try {
                await activateUser(Number(id));
                reply.code(200).send();
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'PUT',
        url: `${adminPrefix}/admin/:id/revoke`,
        schema: revokeUser,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { revokeAdmin, checkAdminAccessRights } = fastify.authService;
            const { id } = request.params;
            checkAdminAccessRights([AccessRights.RevokeAdmin]);

            try {
                await revokeAdmin(Number(id));
                reply.code(200).send();
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'PUT',
        url: `${adminPrefix}/admin/:id/activate`,
        schema: activateUser,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { activateAdmin, checkAdminAccessRights } = fastify.authService;
            const { id } = request.params;
            checkAdminAccessRights([AccessRights.RevokeAdmin]);

            try {
                await activateAdmin(Number(id));
                reply.code(200).send();
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });
};
