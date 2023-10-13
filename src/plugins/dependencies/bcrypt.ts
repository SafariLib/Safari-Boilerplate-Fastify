import bcrypt from 'bcryptjs';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface BcryptPluginOpts {
    saltRounds: number;
}

export type HashString = (string: string) => Promise<string>;
export type CompareStrings = (s1: string, s2: string) => Promise<boolean>;

/**
 * Bcrypt
 * @see https://github.com/kelektiv/node.bcrypt.js
 */
export default plugin((async (fastify, opts: BcryptPluginOpts, done) => {
    if (fastify.hasDecorator('bcrypt')) return done();

    const hashString: HashString = async string => {
        const salt = await bcrypt.genSalt(opts.saltRounds);
        return await bcrypt.hash(string, salt);
    };

    const compareStrings: CompareStrings = async (s1, s2) => {
        return await bcrypt.compare(s1, s2);
    };

    fastify.decorate('bcrypt', { hashString, compareStrings });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        bcrypt: {
            hashString: HashString;
            compareStrings: CompareStrings;
        };
    }
}
