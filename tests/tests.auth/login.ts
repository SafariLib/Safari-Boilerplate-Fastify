import type { FastifyInstance } from 'fastify';
import type UserFactory from '../helper/classes/UserFactory';

export default async (server: FastifyInstance, userFactory: UserFactory) => {
    const res = await server.inject({
        method: 'GET',
        url: '/ping',
    });

    expect(res.statusCode).toEqual(200);
};
