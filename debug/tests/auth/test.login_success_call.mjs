import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData, password } from './utils.mjs';

const TESTS_NAME = 'login';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData(prisma);
    const API = new ApiCaller();

    {
        /*
            Login should be successfull
        */

        for (const user of testUsers) {
            const { res } = await API.POST('/auth/login/user', {
                username: user.username,
                password,
            });

            if (res.status !== 200) {
                logger.error(`FAILED: Log user ${user.username} with success`, res);
            } else {
                logger.success(`SUCCESS: Log user ${user.username} with success`);
            }
        }
        for (const admin of testAdmins) {
            const { res } = await API.POST('/auth/login/admin', {
                username: admin.username,
                password,
            });

            if (res.status !== 200) {
                logger.error(`FAILED: Log admin ${admin.username} with success`, res);
            } else {
                logger.success(`SUCCESS: Log admin ${admin.username} with success`);
            }
        }
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};
