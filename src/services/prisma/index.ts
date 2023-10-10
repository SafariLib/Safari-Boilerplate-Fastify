import type { AccessRights } from '@services/auth/types';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { GetAccessRights, GetUserToLogin, PrismaService, UserToLogin } from './types';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('prismaService')) return done();

    // --- Special Queries ---

    /**
     * Retrieve user from the database and format it for login
     * @param username The username to check
     */
    const getUserToLoginByName: GetUserToLogin = async username => {
        const { prisma } = fastify;
        const user = await prisma.$queryRaw<Array<UserToLogin>>`
            SELECT  
                u."id", u."username", u."password", u."email",
                json_build_object('id', u.role_id, 'name', r.name) AS role,
                u."revoked" AS "isRevoked"
            FROM
                "User" u LEFT JOIN "Role" r ON u.role_id = r.id
            WHERE
                u."username" = ${username};
        `;
        return user?.[0] ?? undefined;
    };

    /**
     * Retrieve user from the database and format it for login
     * @param id The id to check
     */
    const getUserToLoginById: GetUserToLogin = async id => {
        const { prisma } = fastify;
        const user = await prisma.$queryRaw<Array<UserToLogin>>`
            SELECT  
                u."id", u."username", u."password", u."email",
                json_build_object('id', u.role_id, 'name', r.name) AS role,
                u."revoked" AS "isRevoked"
            FROM
                "User" u LEFT JOIN "Role" r ON u.role_id = r.id
            WHERE
                u."id" = ${id};
        `;
        return user?.[0] ?? undefined;
    };

    const getAccessRights: GetAccessRights = async userId => {
        const { prisma } = fastify;
        const { rights } = await prisma.role.findUnique({
            where: { id: userId },
            select: { rights: true },
        });
        return rights as Array<AccessRights>;
    };

    fastify.decorate('prismaService', {
        getUserToLogin: async (getter: string | number) =>
            typeof getter === 'string' ? getUserToLoginByName(getter) : getUserToLoginById(getter),
        getAccessRights,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        prismaService: PrismaService;
    }
}
