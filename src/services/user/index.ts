import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { GetPaginatedUsers, GetUserById, UserService } from './types';
import { resolveOrderByUser, resolvePayloadValidity, resolveSelectUser, resolveWhereUser } from './utils';

export default plugin((async (fastify, _, done) => {
    if (fastify.hasDecorator('userService')) return done();
    const { notFound, badRequest } = fastify.errorService;

    /**
     * Find a user by its id
     * @param id The user id
     * @throws ENTITY_NOT_FOUND
     */
    const getUserById: GetUserById = async id => {
        const user = await fastify.prisma.user.findUnique({
            select: resolveSelectUser('default'),
            where: { id },
        });
        if (!user) notFound('ENTITY_NOT_FOUND');
        return user;
    };

    /**
     * Find many users with pagination and filters
     * @throws PAGINATION_MALFORMED
     * @throws ORDERBY_MALFORMED
     * @throws FILTER_MALFORMED_DATE
     */
    const getPaginatedUsers: GetPaginatedUsers = async ({ page = 1, limit = 10, orderby, orderdir, ...filters }) => {
        const { prisma } = fastify;
        const hasError = resolvePayloadValidity({ page, limit, orderby, orderdir, ...filters });
        if (hasError) badRequest(hasError);

        const users = await prisma.user.findMany({
            select: resolveSelectUser('reduced'),
            where: resolveWhereUser(filters),
            orderBy: resolveOrderByUser(orderby, orderdir),
            skip: (page - 1) * limit,
            take: limit,
        });

        return users;
    };

    fastify.decorate('userService', {
        getUserById,
        getPaginatedUsers,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        userService: UserService;
    }
}
