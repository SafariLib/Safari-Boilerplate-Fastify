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
            throw { errorCode: 'USER_NOT_FOUND', status: 404 };
        }
        if (user.revoked) {
            throw { errorCode: 'USER_REVOKED', status: 401 };
        }
        if (!(await bcrypt.compareStrings(password, user.password))) {
            throw { errorCode: 'USER_INCORRECT_PASSWORD', status: 401 };
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
            throw { errorCode: 'USER_INVALID_ENTITY', status: 400 };
        }
    };

    fastify.decorate('authService', {
        verifyCredentials,
        logUserConnection,
    });
    done();
}) as FastifyPluginCallback);
