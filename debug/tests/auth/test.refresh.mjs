import apiCaller from '../../utils/apiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'refresh token';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testCustomers } = await initData();

    {
        const loginResponse = await apiCaller.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });
        const refreshToken = loginResponse.headers.get('set-cookie').split(';')[0].split('=')[1];

        // if (refreshToken === undefined) {
        //     logger.error(`FAILED: Login does not return refreshToken`, response);
        // } else {
        //     logger.success(`SUCCESS: Login does return refreshToken`);
        // }

        // const refreshResponse = await apiCaller.GET('/auth/refresh', {
        //     refreshToken,
        // });
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
