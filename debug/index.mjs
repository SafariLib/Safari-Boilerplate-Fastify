import testLogin from './tests/auth/test.login.mjs';

(async () => {
    // const response = await apiCaller.POST('/auth/login/user', {
    //     username: 'admin',
    //     password: 'P@ssword123!',
    // });

    await testLogin();
})();
