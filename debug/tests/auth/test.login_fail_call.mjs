import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'login failure';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData(prisma);

    {
        /*
            Login should fail
        */

        const user_client = new ApiCaller();
        const admin_client = new ApiCaller();

        const { res: userRes, userJson } = await user_client.ConnectAsUser(testUsers[0].username, 'wrong password');
        if (userRes.status !== 401 && userJson.message !== 'USER_INCORRECT_PASSWORD') {
            logger.error(`FAILED: User login with wrong password`, res);
        } else {
            logger.success(`SUCCESS: User login with wrong password`);
        }

        const { res: adminRes, adminJson } = await admin_client.ConnectAsAdmin(
            testAdmins[0].username,
            'wrong password',
        );
        if (adminRes.status !== 401 && adminJson.message !== 'USER_INCORRECT_PASSWORD') {
            logger.error(`FAILED: Admin login with wrong password`, res);
        } else {
            logger.success(`SUCCESS: Admin login with wrong password`);
        }

        const { res: pswTooLongRes } = await user_client.ConnectAsUser(
            testUsers[0].username,
            'wrongUsernameThatIsTooLong_____IMeanReallyTooLongLikeSoLongItCanTouchTheSky____EvenLongerThanThat',
        );

        if (pswTooLongRes.status !== 400) {
            logger.error(`FAILED: Fail to reach login controller with malformed payload`, response);
        } else {
            logger.success(`SUCCESS: Fail to reach login controller with malformed payload`);
        }
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};
