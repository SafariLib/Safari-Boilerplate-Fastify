import t from 'tap';
import { TestAPI } from './helper';

t.test('User module tests', async t => {
    const testApi = new TestAPI();
    await testApi.init();
    await import('./modules/user/getUsersAsAdmin').then(({ default: test }) => test(t, testApi));

    // NOTE: Cannot test the users revokation features with the injector
    // It should be tested with the real API

    t.teardown(async () => {
        await testApi.close();
    });
});
