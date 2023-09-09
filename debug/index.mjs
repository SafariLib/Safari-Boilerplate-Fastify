import testConnectionLogs from './tests/auth/test.log.mjs';
import testLogin from './tests/auth/test.login.mjs';

(async () => {
    // const response = await apiCaller.POST('/auth/login/user', {
    //     username: 'admin',
    //     password: 'P@ssword123!',
    // });

    // -----------------------------
    //          AUTH TESTS
    // -----------------------------
    await testLogin();
    await testConnectionLogs();
})();
