import bcrypt from 'bcryptjs';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { Bcrypt, CompareStrings, HashString } from './types';

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

    const hashString: HashString = async string => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(string, salt);
    };

    const compareStrings: CompareStrings = async (s1, s2) => {
        return await bcrypt.compare(s1, s2);
    };

    fastify.decorate('bcrypt', { hashString, compareStrings });
    done();
}) as FastifyPluginCallback);
