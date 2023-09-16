import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'login failure';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();
    const API = new ApiCaller();

    {
        /*
            Login should fail
        */

        for (const user of testUsers) {
            const response = await API.POST('/auth/login/user', {
                username: user.username,
                password: 'wrong password',
            });

            if (response.status !== 401) {
                logger.error(`FAILED: Fail to log user with wrong password`, response);
            } else {
                logger.success(`SUCCESS: Fail to log user with wrong password`);
            }
        }
        for (const admin of testAdmins) {
            const response = await API.POST('/auth/login/admin', {
                username: admin.username,
                password: 'wrong password',
            });

            if (response.status !== 401) {
                logger.error(`FAILED: Fail to log admin with wrong password`, response);
            } else {
                logger.success(`SUCCESS: Fail to log admin with wrong password`);
            }
        }
        for (const user of testUsers) {
            const response = await API.POST('/auth/login/user', {
                username:
                    'wrongUsernameThatIsTooLong_____IMeanReallyTooLongLikeSoLongItCanTouchTheSky____EvenLongerThanThat',
                password: PASSWORD,
            });

            if (response.status !== 400) {
                logger.error(`FAILED: Fail to reach login controller with malformed payload`, response);
            } else {
                logger.success(`SUCCESS: Fail to reach login controller with malformed payload`);
            }
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
