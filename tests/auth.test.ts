import t from 'tap';
import { TestAPI } from './helper';

t.test('Authentication module tests', async t => {
    const testApi = new TestAPI();
    await testApi.init();

    await import('./modules/auth/login').then(({ default: test }) => test(t, testApi));
    await import('./modules/auth/logout').then(({ default: test }) => test(t, testApi));
    await import('./modules/auth/token').then(({ default: test }) => test(t, testApi));

    t.teardown(async () => {
        await testApi.close();
    });
});
