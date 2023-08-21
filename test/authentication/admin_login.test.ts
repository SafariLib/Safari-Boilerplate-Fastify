import server from '../../src/server';

beforeAll(() => {
    server.ready();
});

afterAll(() => {
    server.close();
});

describe('Authentication', () => {
    test('should be able to login', () => {
        console.log('Write Authentication Test');
    });
});
