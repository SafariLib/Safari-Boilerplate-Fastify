import testLogin from './tests/auth/test.login.mjs';
import testToken from './tests/auth/test.token.mjs';

(async () => {
    // const response = await apiCaller.POST('/auth/login/user', {
    //     username: 'admin',
    //     password: 'P@ssword123!',
    // });

    // -----------------------------
    //          AUTH TESTS
    // -----------------------------
    await testLogin();
    await testToken();
})();
