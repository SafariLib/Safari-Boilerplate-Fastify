import bcrypt from 'bcryptjs';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

interface Bcrypt {
    hashString: (string: string) => Promise<string>;
    compareStrings: (s1: string, s2: string) => Promise<boolean>;
}

declare module 'fastify' {
    interface FastifyInstance {
        bcrypt: Bcrypt;
    }
}

/**
 * @package bcryptjs
 * @see https://github.com/kelektiv/node.bcrypt.js
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('bcrypt')) return done();

    const hashString = async (string: string): Promise<string> => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(string, salt);
    };

    const compareStrings = async (s1: string, s2: string): Promise<boolean> => {
        return await bcrypt.compare(s1, s2);
    };

    fastify.decorate('bcrypt', { hashString, compareStrings });
    done();
}) as FastifyPluginCallback);
