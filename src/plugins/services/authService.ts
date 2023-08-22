import { Customer, User } from '@prisma/client';
import { TokenContent } from '@types';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

type VerifyCredentials = (
    payload: { username: string; password: string },
    table: 'user' | 'customer',
) => Promise<{
    tokenContent: TokenContent;
    user: Omit<User, 'password'> | Omit<Customer, 'password'>;
}>;

type LogUserConnection = (user_id: number, ip: string, user_agent: string) => Promise<void>;

declare module 'fastify' {
    interface FastifyInstance {
        authService: {
            verifyCredentials: VerifyCredentials;
            logUserConnection: LogUserConnection;
        };
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return fastify.log.warn('authService already registered');

    const verifyCredentials: VerifyCredentials = async ({ username, password }, table) => {
        const { prisma, bcrypt } = fastify;

        const [user] = await prisma.$queryRaw<Customer[] | User[]>`
            SELECT * FROM ${table} WHERE username = ${username}
        `;

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }
        if (user.revoked) {
            throw new Error('USER_REVOKED');
        }
        if (!(await bcrypt.compareStrings(password, user.password))) {
            throw new Error('USER_INCORRECT_PASSWORD');
        }

        delete user.password;

        return {
            tokenContent: {
                id: user.id,
                username: user.username,
                role: user?.role,
            },
            user,
        };
    };

    const logUserConnection: LogUserConnection = async (user_id: number, ip: string, user_agent: string) => {
        const { prisma } = fastify;

        await prisma.userConnectionLog.create({
            data: {
                ip,
                user_agent,
                user_id,
            },
        });
    };

    fastify.decorate('authService', {
        verifyCredentials,
        logUserConnection,
    });
    done();
}) as FastifyPluginCallback);
