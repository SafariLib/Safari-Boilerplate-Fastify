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

    const selectUserQuery = Prisma.sql`
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
     * Find many users with pagination and filters
     * @param page The page number
     * @param limit The page limit
     * @param filters The filters
     * @throws UNAUTHORIZED_OPERATION
     */
    const getPaginatedUsers: GetPaginatedUsers = async (page, limit, filters) => {
        if (page < 0 || limit < 0) throw { status: 400, errorCode: 'PAGINATION_MALFORMED' };
        if (limit > 100) throw { status: 400, errorCode: 'PAGINATION_LIMIT_EXCEEDED' };

        const { username, email, ...rest } = filters ?? {};

        // FIXME : this breaks
        if (username) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${selectUserQuery} WHERE u.username LIKE %${username.toLowerCase()}%;
            `;
            return !user ? [] : user;
        }
        if (email) {
            const user = await fastify.prisma.$queryRaw<Array<GetUser>>`
                ${selectUserQuery} WHERE u.email LIKE %${email.toLowerCase()}%;
            `;
            return !user ? [] : user;
        }

        const where = Array<Prisma.Sql>();
        Object.entries(rest).forEach(([key, value]) => {
            if (key === 'role') {
                typeof value === 'string' && where.push(Prisma.sql`r.name = ${value}`);
            } else if (key === 'revoked') {
                typeof value === 'boolean' && where.push(Prisma.sql`u.revoked = ${value}`);
            } else if (dateFilters.includes(key)) {
                const date = (() => {
                    const v = new Date(value as string);
                    if (v.toString() === 'Invalid Date') throw { status: 400, errorCode: 'FILTER_MALFORMED_DATE' };
                    return v;
                })();

                if (key === 'created_after') {
                    where.push(Prisma.sql`u.created_at >= ${date}`);
                } else if (key === 'created_before') {
                    where.push(Prisma.sql`u.created_at <= ${date}`);
                } else if (key === 'updated_after') {
                    where.push(Prisma.sql`u.updated_at >= ${date}`);
                } else if (key === 'updated_before') {
                    where.push(Prisma.sql`u.updated_at <= ${date}`);
                }
            }
        });

        return await fastify.prisma.$queryRaw<Array<GetUser>>`
            ${selectUserQuery}
            ${where.length ? Prisma.join(where, ' AND ', ' WHERE ') : Prisma.empty}
            ORDER BY u.id ASC
            OFFSET ${page * limit}
            LIMIT ${limit};
        `;
    };

    fastify.decorate('userService', {
        getUserById,
        getPaginatedUsers,
    });
    done();
}) as FastifyPluginCallback);

interface UserService {
    getUserById: GetUserById;
    getPaginatedUsers: GetPaginatedUsers;
}

declare module 'fastify' {
    interface FastifyInstance {
        userService: UserService;
    }
}
