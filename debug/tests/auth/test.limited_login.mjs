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
        for (let i = 0; i < 5; i++) await adminLogWrongPasswordSpamer();
        const adminLogWrongPasswordRes = await (async () => {
            const res = await adminLogWrongPasswordSpamer();
            const { message } = await res.json();
            return message;
        })();

        // User login attempts
        for (let i = 0; i < 5; i++) await userLogWrongPasswordSpamer();
        const userLogWrongPasswordRes = await (async () => {
            const res = await userLogWrongPasswordSpamer();
            const { message } = await res.json();
            return message;
        })();

        if (adminLogWrongPasswordRes !== 'USER_TOO_MANY_ATTEMPTS') {
            logger.error(`FAILED: Admin login attempt successfully limited to 5 per 15min`, adminLogWrongPasswordRes);
        } else {
            logger.success(`SUCCESS: Admin login attempt successfully limited to 5 per 15min`);
        }
        if (userLogWrongPasswordRes !== 'USER_TOO_MANY_ATTEMPTS') {
            logger.error(`FAILED: User login attempt successfully limited to 5 per 15min`, userLogWrongPasswordRes);
        } else {
            logger.success(`SUCCESS: User login attempt successfully limited to 5 per 15min`);
        }

        // Other client should be able to login with the same credentials
        // I don't know how to fake ip address so I don't know how to test this
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
