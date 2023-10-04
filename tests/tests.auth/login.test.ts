import server from '@root/src/server';

(async () => {
    describe('Successfull login', () => {
        beforeAll(async () => await server.ready());
        afterAll(async () => await server.close());

        it('should login a user', async () => {
            const res = await server.inject({
                method: 'GET',
                url: '/ping',
            });

            expect(res.statusCode).toEqual(200);
        });
    });
})();
