import { Prisma } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

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

interface GetPaginatedUsersQuery {
    username?: string;
    email?: string;
    role?: string;
    revoked?: boolean;
    created_after?: Date;
    created_before?: Date;
    updated_after?: Date;
    updated_before?: Date;
}

type GetUserById = (id: number) => Promise<GetUser>;
type GetPaginatedUsers = (page: number, limit: number, filters?: GetPaginatedUsersQuery) => Promise<Array<GetUser>>;

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('userService')) return done();

    const { sql, empty: sqlEmpty, join: sqlJoin } = Prisma;

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
    const getPaginatedUsers: GetPaginatedUsers = async (page, limit, filters) => {
        if (page < 0 || limit < 0) throw { status: 400, errorCode: 'PAGINATION_MALFORMED' };
        if (limit > 100) throw { status: 400, errorCode: 'PAGINATION_LIMIT_EXCEEDED' };

        const { username, email, ...rest } = filters ?? {};

        if (username) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${selectUserQuery} WHERE lower(u.username) 
                LIKE lower(\'%\' || ${username} || \'%\')
                OFFSET ${page * limit}
                LIMIT ${limit};
            `;
            return !user ? [] : user;
        }
        if (email) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${selectUserQuery} WHERE lower(u.email) 
                LIKE lower(\'%\' || ${email} || \'%\')
                OFFSET ${page * limit}
                LIMIT ${limit};
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
            ${where}
            ORDER BY u.id ASC
            OFFSET ${page * limit}
            LIMIT ${limit};
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
    const getPaginatedAdmins: GetPaginatedUsers = async (page, limit, filters) => {
        if (page < 0 || limit < 0) throw { status: 400, errorCode: 'PAGINATION_MALFORMED' };
        if (limit > 100) throw { status: 400, errorCode: 'PAGINATION_LIMIT_EXCEEDED' };

        const { username, email, ...rest } = filters ?? {};

        if (username) {
            const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
                ${selectAdminQuery} WHERE lower(u.username) 
                LIKE lower(\'%\' || ${username} || \'%\')
                OFFSET ${page * limit}
                LIMIT ${limit};
            `;
            return !admin ? [] : admin;
        }
        if (email) {
            const admin = await fastify.prisma.$queryRaw<Array<GetAdmin>>`
                ${selectAdminQuery} WHERE lower(u.email) 
                LIKE lower(\'%\' || ${email} || \'%\')
                OFFSET ${page * limit}
                LIMIT ${limit};
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
            ${selectAdminQuery}
            ${where}
            ORDER BY u.id ASC
            OFFSET ${page * limit}
            LIMIT ${limit};
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
