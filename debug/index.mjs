import testLogin from './tests/auth/test.login.mjs';

/*
    WARNING: This script is for debug purposes only.
    Do not write versionned code here as it will be overwritten.
*/

(async () => {
    // const response = await apiCaller.POST('/auth/login/user', {
    //     username: 'admin',
    //     password: 'P@ssword123!',
    // });

    await testLogin();
})();
