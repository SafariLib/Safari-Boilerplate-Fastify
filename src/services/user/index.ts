import { Prisma } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { GetAdmin, GetPaginatedUsers, GetUser, GetUserById } from './types';
import { dateFilters, defaultSelectAdminQuery, defaultSelectUserQuery, orderColumns } from './utils';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('userService')) return done();

    /**
     * Find a user by its id
     * @param id The user id
     * @throws ENTITY_NOT_FOUND
     */
    const getUserById: GetUserById = async id => {
        const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
            ${defaultSelectUserQuery} WHERE u.id = ${Number(id)};
        `;
        if (!user.length) throw { status: 404, errorCode: 'ENTITY_NOT_FOUND' };
        return user[0];
    };

    /**
     * Find an admin by its id
     * @param id The admin id
     * @throws ENTITY_NOT_FOUND
     */
    const getAdminById: GetUserById = async id => {
        const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
            ${defaultSelectAdminQuery} WHERE u.id = ${Number(id)};
        `;
        if (!admin.length) throw { status: 404, errorCode: 'ENTITY_NOT_FOUND' };
        return admin[0];
    };

    /**
     * Find many users with pagination and filters
     * @param page The page number
     * @param limit The page limit
     * @param filters The filters
     * @throws PAGINATION_MALFORMED
     * @throws PAGINATION_LIMIT_EXCEEDED
     * @throws ORDERBY_MALFORMED
     * @throws FILTER_MALFORMED_DATE
     */
    const getPaginatedUsers: GetPaginatedUsers = async ({ page = 1, limit = 10, orderby, orderdir, ...filters }) => {
        const { buildPaginatedQuery, buildOrderByQuery } = fastify.queryService;
        const { prisma } = fastify;
        const paginatedQuery = buildPaginatedQuery(page, limit);
        const orderByQuery = buildOrderByQuery(orderby, orderdir, orderColumns);

        const { username, email, ...rest } = filters ?? {};

        if (username) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${defaultSelectUserQuery} WHERE lower(u.username) 
                LIKE lower(\'%\' || ${username} || \'%\')
                ${orderByQuery}
                ${paginatedQuery}
                ;
            `;
            return !user ? [] : user;
        }
        if (email) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${defaultSelectUserQuery} WHERE lower(u.email) 
                LIKE lower(\'%\' || ${email} || \'%\')
                ${orderByQuery}
                ${paginatedQuery}
                ;
            `;
            return !user ? [] : user;
        }

        const where = (() => {
            const queries = Object.entries(rest).map(([key, value]) => {
                if (key === 'role' && typeof value === 'string') {
                    return Prisma.sql`r.name = ${value}`;
                } else if (key === 'revoked' && typeof value === 'boolean') {
                    return Prisma.sql`u.revoked = ${value}`;
                } else if (dateFilters.includes(key)) {
                    const date = (() => {
                        const v = new Date(value as string);
                        if (v.toString() === 'Invalid Date') throw { status: 400, errorCode: 'FILTER_MALFORMED_DATE' };
                        return v;
                    })();

                    if (key === 'created_after') {
                        return Prisma.sql`u.created_at >= ${date}`;
                    } else if (key === 'created_before') {
                        return Prisma.sql`u.created_at <= ${date}`;
                    } else if (key === 'updated_after') {
                        return Prisma.sql`u.updated_at >= ${date}`;
                    } else if (key === 'updated_before') {
                        return Prisma.sql`u.updated_at <= ${date}`;
                    }
                }
            });

            return queries.length ? Prisma.sql`${Prisma.join(queries, ' AND ', 'WHERE ')}` : Prisma.empty;
        })();

        return await prisma.$queryRaw<Array<GetUser>>`
            ${defaultSelectUserQuery}
            ${where}
            ${orderByQuery}
            ${paginatedQuery}
            ;
        `;
    };

    /**
     * Find many admins with pagination and filters
     * @param page The page number
     * @param limit The page limit
     * @param filters The filters
     * @throws PAGINATION_MALFORMED
     * @throws PAGINATION_LIMIT_EXCEEDED
     * @throws ORDERBY_MALFORMED
     * @throws FILTER_MALFORMED_DATE
     */
    const getPaginatedAdmins: GetPaginatedUsers = async ({ page = 1, limit = 10, orderby, orderdir, ...filters }) => {
        const { buildPaginatedQuery, buildOrderByQuery } = fastify.queryService;
        const { prisma } = fastify;
        const paginatedQuery = buildPaginatedQuery(page, limit);
        const orderByQuery = buildOrderByQuery(orderby, orderdir, orderColumns);

        const { username, email, ...rest } = filters ?? {};

        if (username) {
            const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
                ${defaultSelectAdminQuery} WHERE lower(u.username) 
                LIKE lower(\'%\' || ${username} || \'%\')
                ${orderByQuery}
                ${paginatedQuery}
                ;
            `;
            return !admin ? [] : admin;
        }
        if (email) {
            const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
                ${defaultSelectAdminQuery} WHERE lower(u.email) 
                LIKE lower(\'%\' || ${email} || \'%\')
                ${orderByQuery}
                ${paginatedQuery}
                ;
            `;
            return !admin ? [] : admin;
        }

        const where = (() => {
            const queries = Object.entries(rest).map(([key, value]) => {
                if (key === 'role' && typeof value === 'string') {
                    return Prisma.sql`r.name = ${value}`;
                } else if (key === 'revoked' && typeof value === 'boolean') {
                    return Prisma.sql`u.revoked = ${value}`;
                } else if (dateFilters.includes(key)) {
                    const date = (() => {
                        const v = new Date(value as string);
                        if (v.toString() === 'Invalid Date') throw { status: 400, errorCode: 'FILTER_MALFORMED_DATE' };
                        return v;
                    })();

                    if (key === 'created_after') {
                        return Prisma.sql`u.created_at >= ${date}`;
                    } else if (key === 'created_before') {
                        return Prisma.sql`u.created_at <= ${date}`;
                    } else if (key === 'updated_after') {
                        return Prisma.sql`u.updated_at >= ${date}`;
                    } else if (key === 'updated_before') {
                        return Prisma.sql`u.updated_at <= ${date}`;
                    }
                }
            });

            return queries.length ? Prisma.sql`${Prisma.join(queries, ' AND ', 'WHERE ')}` : Prisma.empty;
        })();

        return await prisma.$queryRaw<Array<GetAdmin>>`
            ${defaultSelectAdminQuery}
            ${where}
            ${orderByQuery}
            ${paginatedQuery}
            ;
        `;
    };

    // const createAdmin: CreateAdmin = async ({ username, email, roleId }) => {
    //     const { prisma, authService } = fastify;
    //     const adminId = authService.getUserId();
    // };

    fastify.decorate('userService', {
        getUserById,
        getPaginatedUsers,
        getAdminById,
        getPaginatedAdmins,
    });
    done();
}) as FastifyPluginCallback);

interface UserService {
    getUserById: GetUserById;
    getPaginatedUsers: GetPaginatedUsers;
    getAdminById: GetUserById;
    getPaginatedAdmins: GetPaginatedUsers;
}

declare module 'fastify' {
    interface FastifyInstance {
        userService: UserService;
    }
}
