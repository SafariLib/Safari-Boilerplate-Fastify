import apiCaller from './utils/apiCaller.mjs';

/*
    WARNING: This script is for debug purposes only.
    Do not write versionned code here as it will be overwritten.
*/

(async () => {
    await apiCaller.GET('/ping');

    await apiCaller.POST('/test', { lol: 'lol' });

    // const response = await apiCaller.POST('/auth/login/user', {
    //     username: 'admin',
    //     password: 'P@ssword123!',
    // });
})();
