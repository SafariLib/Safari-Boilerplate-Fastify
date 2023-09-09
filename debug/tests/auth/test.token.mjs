import { isIPv4 } from 'net';
import apiCaller, { HEADERS } from '../../utils/apiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, getCustomerCachedToken, getUserCachedToken, initData } from './utils.mjs';

const TESTS_NAME = 'Token';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testCustomers } = await initData();

    {
        /*
            Login should generate token cache
        */

        await apiCaller.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        await apiCaller.POST('/auth/login/customer', {
            username: testCustomers[0].username,
            password: PASSWORD,
        });

        const userToken = await getUserCachedToken(testUsers[0].email);
        const customerToken = await getCustomerCachedToken(testCustomers[0].email);

        if (!isIPv4(userToken[0].ip)) {
            logger.error(`FAILED: Got invalid IP address: ${userToken[0].ip}`);
        } else if (userToken[0].user_agent !== HEADERS['User-Agent']) {
            logger.error(`FAILED: Got invalid user agent: "${userToken[0].user_agent}" != ${HEADERS['User-Agent']}`);
        } else if (userToken[0].created_at > Date.now() || userToken[0].created_at < Date.now() - 1000) {
            logger.error(`FAILED: Got invalid timestamp: ${userToken[0].created_at}`);
        } else if (userToken[0].revoked) {
            logger.error(`FAILED: Got invalid revoked status: ${userToken[0].revoked}`);
        } else {
            logger.success(`SUCCESS: User log has generated a cached token with success`);
        }

        if (!isIPv4(customerToken[0].ip)) {
            logger.error(`FAILED: Got invalid IP address: ${customerToken[0].ip}`);
        } else if (customerToken[0].user_agent !== HEADERS['User-Agent']) {
            logger.error(
                `FAILED: Got invalid user agent: "${customerToken[0].user_agent}" != "${HEADERS['User-Agent']}"`,
            );
        } else if (customerToken[0].created_at > Date.now() || customerToken[0].created_at < Date.now() - 1000) {
            logger.error(`FAILED: Got invalid timestamp: ${customerToken[0].created_at}`);
        } else if (!customerToken[0].revoked) {
            logger.error(`FAILED: Got invalid revoked status: ${customerToken[0].revoked}`);
        } else {
            logger.success(`SUCCESS: Customer log formated and created with success`);
        }
    }

    {
        // const loginResponse = await apiCaller.POST('/auth/login/user', {
        //     username: testUsers[0].username,
        //     password: PASSWORD,
        // });
        // const refreshToken = loginResponse.headers.get('set-cookie').split(';')[0].split('=')[1];
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
