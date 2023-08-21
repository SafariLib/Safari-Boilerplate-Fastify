import { User } from '@prisma/client';
import { TokenContent } from '@types';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

type VerifyCredentials = (
    username: string,
    password: string,
) => Promise<{
    tokenContent: TokenContent;
    user: Omit<User, 'password'>;
}>;

declare module 'fastify' {
    interface FastifyInstance {
        authService: {
            verifyCredentials: VerifyCredentials;
        };
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return fastify.log.warn('authService already registered');

    const verifyCredentials: VerifyCredentials = async (username, password) => {
        const { prisma, bcrypt } = fastify;

        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

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
                role: user.role,
            },
            user,
        };
    };

    fastify.decorate('authService', {
        verifyCredentials,
    });
    done();
}) as FastifyPluginCallback);
