import { Prisma } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { GetPaginatedUsersPayload } from '../../controllers/user/types';

interface GetUser {
    id: number;
    username: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    avatarUrl: string;
    revoked: boolean;
    createdAt: string;
    updatedAt: string;
}
interface GetAdmin extends GetUser {}

type GetUserById = (id: number) => Promise<GetUser>;
type GetPaginatedUsers = (payload: GetPaginatedUsersPayload['Querystring']) => Promise<Array<GetUser>>;

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('userService')) return done();

    const { sql, empty: sqlEmpty, join: sqlJoin } = Prisma;

    const orderColumns = ['u.username', 'u.email', 'u.revoked'];

    const selectUserQuery = sql`
        SELECT
            u.id,
            u.username,
            u.email,
            u.avatar_url as "avatarUrl",
            u.revoked,
            u.created_at as "createdAt",
            u.updated_at as "updatedAt",
            json_build_object('id', u.role_id, 'name', r.name) AS role
        FROM "User" u INNER JOIN "UserRole" r ON u.role_id = r.id
    `;

    const selectAdminQuery = sql`
        SELECT
            u.id,
            u.username,
            u.email,
            u.avatar_url as "avatarUrl",
            u.revoked,
            u.created_at as "createdAt",
            u.updated_at as "updatedAt",
            json_build_object('id', u.role_id, 'name', r.name) AS role
        FROM "Admin" u INNER JOIN "AdminRole" r ON u.role_id = r.id
    `;

    const dateFilters = ['created_after', 'created_before', 'updated_after', 'updated_before'];

    /**
     * Find a user by its id
     * @param id The user id
     * @throws ENTITY_NOT_FOUND
     */
    const getUserById: GetUserById = async id => {
        const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
            ${selectUserQuery} WHERE u.id = ${Number(id)};
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
            ${selectAdminQuery} WHERE u.id = ${Number(id)};
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
     * @throws FILTER_MALFORMED_DATE
     */
    const getPaginatedUsers: GetPaginatedUsers = async ({ page = 0, limit = 10, orderby, orderdir, ...filters }) => {
        const { buildPaginatedQuery, buildOrderByQuery } = fastify.queryService;
        const paginatedQuery = buildPaginatedQuery(page, limit);
        const orderByQuery = buildOrderByQuery(orderby, orderdir, orderColumns);

        const { username, email, ...rest } = filters ?? {};

        if (username) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${selectUserQuery} WHERE lower(u.username) 
                LIKE lower(\'%\' || ${username} || \'%\')
                ${paginatedQuery};
            `;
            return !user ? [] : user;
        }
        if (email) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${selectUserQuery} WHERE lower(u.email) 
                LIKE lower(\'%\' || ${email} || \'%\')
                ${paginatedQuery};
            `;
            return !user ? [] : user;
        }

        const where = (() => {
            const queries = Object.entries(rest).map(([key, value]) => {
                if (key === 'role' && typeof value === 'string') {
                    return sql`r.name = ${value}`;
                } else if (key === 'revoked' && typeof value === 'boolean') {
                    return sql`u.revoked = ${value}`;
                } else if (dateFilters.includes(key)) {
                    const date = (() => {
                        const v = new Date(value as string);
                        if (v.toString() === 'Invalid Date') throw { status: 400, errorCode: 'FILTER_MALFORMED_DATE' };
                        return v;
                    })();

                    if (key === 'created_after') {
                        return sql`u.created_at >= ${date}`;
                    } else if (key === 'created_before') {
                        return sql`u.created_at <= ${date}`;
                    } else if (key === 'updated_after') {
                        return sql`u.updated_at >= ${date}`;
                    } else if (key === 'updated_before') {
                        return sql`u.updated_at <= ${date}`;
                    }
                }
            });

            return queries.length ? sql`${sqlJoin(queries, ' AND ', 'WHERE ')}` : sqlEmpty;
        })();

        return await fastify.prisma.$queryRaw<Array<GetUser>>`
            ${selectUserQuery}
            ${orderByQuery} 
            ${paginatedQuery}
            ${where}
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
     * @throws FILTER_MALFORMED_DATE
     */
    const getPaginatedAdmins: GetPaginatedUsers = async ({ page = 0, limit = 10, orderby, orderdir, ...filters }) => {
        const { buildPaginatedQuery, buildOrderByQuery } = fastify.queryService;
        const paginatedQuery = buildPaginatedQuery(page, limit);
        const orderByQuery = buildOrderByQuery(orderby, orderdir, orderColumns);

        const { username, email, ...rest } = filters ?? {};

        if (username) {
            const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
                ${selectAdminQuery} WHERE lower(u.username) 
                LIKE lower(\'%\' || ${username} || \'%\')
                ${paginatedQuery};
            `;
            return !admin ? [] : admin;
        }
        if (email) {
            const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
                ${selectAdminQuery} WHERE lower(u.email) 
                LIKE lower(\'%\' || ${email} || \'%\')
                ${paginatedQuery};
            `;
            return !admin ? [] : admin;
        }

        const where = (() => {
            const queries = Object.entries(rest).map(([key, value]) => {
                if (key === 'role' && typeof value === 'string') {
                    return sql`r.name = ${value}`;
                } else if (key === 'revoked' && typeof value === 'boolean') {
                    return sql`u.revoked = ${value}`;
                } else if (dateFilters.includes(key)) {
                    const date = (() => {
                        const v = new Date(value as string);
                        if (v.toString() === 'Invalid Date') throw { status: 400, errorCode: 'FILTER_MALFORMED_DATE' };
                        return v;
                    })();

                    if (key === 'created_after') {
                        return sql`u.created_at >= ${date}`;
                    } else if (key === 'created_before') {
                        return sql`u.created_at <= ${date}`;
                    } else if (key === 'updated_after') {
                        return sql`u.updated_at >= ${date}`;
                    } else if (key === 'updated_before') {
                        return sql`u.updated_at <= ${date}`;
                    }
                }
            });

            return queries.length ? sql`${sqlJoin(queries, ' AND ', 'WHERE ')}` : sqlEmpty;
        })();

        return await fastify.prisma.$queryRaw<Array<GetAdmin>>`
            ${selectUserQuery}
            ${orderByQuery} 
            ${paginatedQuery}
            ${where}
            ;
        `;
    };

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
