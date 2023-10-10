import { AccessRights } from '@services/auth/types';
import type { FastifyInstance, FastifyReply as Reply, FastifyRequest as Request } from 'fastify';
import {
    activateUser as activateSchema,
    getUserById as getByIdSchema,
    getUsers as getSchema,
    revokeUser as revokeSchema
} from './schemas';
import type { GetPaginatedUsersPayload, GetUserByIdPayload } from './types';

export default async (fastify: FastifyInstance) => {
    const { protectedPrefix } = fastify.requestService;
    const { getUserById } = fastify.userService;
    const { activateUser, revokeUser, checkAccessRights } = fastify.authService;

    fastify.route({
        method: 'GET',
        url: `${protectedPrefix}/user`,
        schema: getSchema,
        handler: async (request: Request<GetPaginatedUsersPayload>, reply: Reply) => {
            const { userService } = fastify;
            try {
                const users = await userService.getPaginatedUsers(request.query);
                reply.code(200).send(users);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'GET',
        url: `${protectedPrefix}/user/:id`,
        schema: getByIdSchema,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { id } = request.params;
            try {
                const user = await getUserById(Number(id));
                reply.code(200).send(user);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'PATCH',
        url: `${protectedPrefix}/user/:id/revoke`,
        schema: revokeSchema,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { id } = request.params;
            await checkAccessRights([AccessRights.RevokeUser]);

            try {
                await revokeUser(Number(id));
                reply.code(200);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });

    fastify.route({
        method: 'PATCH',
        url: `${protectedPrefix}/user/:id/activate`,
        schema: activateSchema,
        handler: async (request: Request<GetUserByIdPayload>, reply: Reply) => {
            const { id } = request.params;
            await checkAccessRights([AccessRights.RevokeUser]);

            try {
                await activateUser(Number(id));
                reply.code(200);
            } catch (e) {
                reply.code(e?.status ?? 500).send({ message: e?.errorCode ?? e });
            }
        },
    });
};
