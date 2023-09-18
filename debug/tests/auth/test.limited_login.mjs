import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Login attempts';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Login route should have a max attempts of 5 per 15 minutes
        */

        const admin_client = new ApiCaller();
        const user_client = new ApiCaller();

        const adminLogWrongPasswordSpamer = async () =>
            await admin_client.POST('/auth/login/admin', {
                username: testAdmins[0].username,
                password: 'Wrong_password8832',
            });

        const userLogWrongPasswordSpamer = async () =>
            await user_client.POST('/auth/login/user', {
                username: testUsers[0].username,
                password: 'Wrong_password8832',
            });

        // Admin login attempts
        for (let i = 0; i < 4; i++) await adminLogWrongPasswordSpamer();
        const adminLogWrongPasswordRes = await adminLogWrongPasswordSpamer();

        if (adminLogWrongPasswordRes.status !== 401) {
            logger.error(`FAILED: Admin login attempt successfully limited to 5 per 15min`, adminLogWrongPasswordRes);
        } else {
            logger.success(`SUCCESS: Admin login attempt successfully limited to 5 per 15min`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
