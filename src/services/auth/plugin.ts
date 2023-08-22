import { Customer, User } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { LogUserConnection, VerifyCredentials } from './types';

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

    const verifyCredentials: VerifyCredentials = async ({ username, password }, entity) => {
        const { prisma, bcrypt } = fastify;

        const [user] = await prisma.$queryRaw<Customer[] | User[]>`
            SELECT * FROM ${entity} WHERE username = ${username}
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

    const logUserConnection: LogUserConnection = async (user_id, ip, user_agent, entity) => {
        const { prisma } = fastify;

        if (entity === 'user') {
            await prisma.userConnectionLog.create({
                data: {
                    ip,
                    user_agent,
                    user_id,
                },
            });
        } else if (entity === 'customer') {
            await prisma.customerConnectionLog.create({
                data: {
                    ip,
                    user_agent,
                    customer_id: user_id,
                },
            });
        } else {
            throw new Error('USER_INVALID_ENTITY');
        }
    };

    fastify.decorate('authService', {
        verifyCredentials,
        logUserConnection,
    });
    done();
}) as FastifyPluginCallback);
