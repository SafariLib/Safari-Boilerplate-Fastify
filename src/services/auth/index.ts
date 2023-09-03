import { Customer, User } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { LogUserConnection, VerifyUserOrAdminCredentials } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        authService: {
            verifyUserCredentials: VerifyUserOrAdminCredentials;
            verifyCustomerCredentials: VerifyUserOrAdminCredentials;
            logUserConnection: LogUserConnection;
            logCustomerConnection: LogUserConnection;
        };
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return fastify.log.warn('authService already registered');

    const verifyCredentials = async (entity: Customer | User, password: string) => {
        const { bcrypt } = fastify;

        if (!entity) {
            throw { errorCode: 'USER_NOT_FOUND', status: 404 };
        }
        if (entity.revoked) {
            throw { errorCode: 'USER_REVOKED', status: 401 };
        }
        if (!(await bcrypt.compareStrings(password, entity.password))) {
            throw { errorCode: 'USER_INCORRECT_PASSWORD', status: 401 };
        }

        delete entity.password;

        return {
            tokenContent: {
                id: entity.id,
                username: entity.username,
                role: entity?.role,
            },
            user: entity,
        };
    };

    const verifyUserCredentials: VerifyUserOrAdminCredentials = async ({ username, password }) => {
        const { prisma } = fastify;
        const user = await prisma.user.findUnique({ where: { username } });
        return await verifyCredentials(user, password);
    };

    const verifyCustomerCredentials: VerifyUserOrAdminCredentials = async ({ username, password }) => {
        const { prisma } = fastify;
        const customer = await prisma.customer.findUnique({ where: { username } });
        return await verifyCredentials(customer, password);
    };

    const logUserConnection: LogUserConnection = async (user_id, ip, user_agent) => {
        const { prisma } = fastify;
        await prisma.userConnectionLog.create({
            data: {
                ip,
                user_agent,
                user_id,
            },
        });
    };

    const logCustomerConnection: LogUserConnection = async (user_id, ip, user_agent) => {
        const { prisma } = fastify;
        await prisma.customerConnectionLog.create({
            data: {
                ip,
                user_agent,
                customer_id: user_id,
            },
        });
    };

    fastify.decorate('authService', {
        verifyUserCredentials,
        verifyCustomerCredentials,
        logUserConnection,
        logCustomerConnection,
    });
    done();
}) as FastifyPluginCallback);
