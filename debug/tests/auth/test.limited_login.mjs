import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Login attempts';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData(prisma);

    {
        /*
            Login route should have a max attempts of 5 per 15 minutes
        */

        const admin_client = new ApiCaller();
        const user_client = new ApiCaller();

        // Admin login attempts
        for (let i = 0; i < 5; i++) await admin_client.ConnectAsAdmin(testAdmins[0].username, 'Wrong_password8832');
        const adminLogin = await admin_client.ConnectAsAdmin(testAdmins[0].username);

        // User login attempts
        for (let i = 0; i < 5; i++) await user_client.ConnectAsUser(testUsers[0].username, 'Wrong_password8832');
        const userLogin = await user_client.ConnectAsUser(testUsers[0].username);

        if (adminLogin.json.message !== 'USER_TOO_MANY_ATTEMPTS') {
            logger.error(`FAILED: Admin login attempt successfully limited to 5 per 15min`, adminLogin.json.message);
        } else {
            logger.success(`SUCCESS: Admin login attempt successfully limited to 5 per 15min`);
        }
        if (userLogin.json.message !== 'USER_TOO_MANY_ATTEMPTS') {
            logger.error(`FAILED: User login attempt successfully limited to 5 per 15min`, userLogin.json.message);
        } else {
            logger.success(`SUCCESS: User login attempt successfully limited to 5 per 15min`);
        }

        // Other client should be able to login with the same credentials
        // I don't know how to fake ip address so I don't know how to test this
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};
