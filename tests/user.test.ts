import t from 'tap';
import { TestAPI } from './helper';

t.test('User module tests', async t => {
    const testApi = new TestAPI();
    await testApi.init();

    await import('./modules/user/getUsersAsAdmin').then(({ default: test }) => test(t, testApi));
    await import('./modules/user/revokeUsers').then(({ default: test }) => test(t, testApi));

    t.teardown(async () => {
        await testApi.close();
    });
});
