import t from 'tap';
import { TestAPI } from './helper';

t.test('Authentication module tests', async t => {
    const testApi = new TestAPI();
    await testApi.init();

    await import('./auth.tests/login').then(({ default: test }) => test(t, testApi));
    await import('./auth.tests/token').then(({ default: test }) => test(t, testApi));

    t.teardown(async () => {
        await testApi.close();
    });
});
