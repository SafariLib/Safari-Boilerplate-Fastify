import { isIPv4 } from 'net';
import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, getCustomerCachedToken, getUserCachedToken, initData } from './utils.mjs';

const TESTS_NAME = 'Token';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testCustomers } = await initData();

    {
        const API = new ApiCaller();
        /*
            Login should generate token cache
        */

        await API.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        await API.POST('/auth/login/customer', {
            username: testCustomers[0].username,
            password: PASSWORD,
        });

        const userToken = await getUserCachedToken(testUsers[0].email);
        const customerToken = await getCustomerCachedToken(testCustomers[0].email);

        if (!isIPv4(userToken[0].ip)) {
            logger.error(`FAILED: Got invalid IP address: ${userToken[0].ip}`);
        } else if (userToken[0].user_agent !== API.HEADERS['User-Agent']) {
            logger.error(
                `FAILED: Got invalid user agent: "${userToken[0].user_agent}" != ${API.HEADERS['User-Agent']}`,
            );
        } else if (userToken[0].created_at > Date.now() || userToken[0].created_at < Date.now() - 1000) {
            logger.error(`FAILED: Got invalid timestamp: ${userToken[0].created_at}`);
        } else if (userToken[0].revoked) {
            logger.error(`FAILED: Got invalid revoked status: ${userToken[0].revoked}`);
        } else {
            logger.success(`SUCCESS: User login has generated a cached token with success`);
        }

        if (!isIPv4(customerToken[0].ip)) {
            logger.error(`FAILED: Got invalid IP address: ${customerToken[0].ip}`);
        } else if (customerToken[0].user_agent !== API.HEADERS['User-Agent']) {
            logger.error(
                `FAILED: Got invalid user agent: "${customerToken[0].user_agent}" != "${API.HEADERS['User-Agent']}"`,
            );
        } else if (customerToken[0].created_at > Date.now() || customerToken[0].created_at < Date.now() - 1000) {
            logger.error(`FAILED: Got invalid timestamp: ${customerToken[0].created_at}`);
        } else if (!customerToken[0].revoked) {
            logger.error(`FAILED: Got invalid revoked status: ${customerToken[0].revoked}`);
        } else {
            logger.success(`SUCCESS: Customer login has generated a cached token with success`);
        }
    }

    {
        /*
            Login of one user with two clients should generate two tokens with the same signature
            Logout of one client should revoke only one token
        */

        const client_1 = new ApiCaller();
        const client_2 = new ApiCaller();
        const client_3 = new ApiCaller();
        const client_4 = new ApiCaller();

        const res_1 = await client_1.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const res_2 = await client_2.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const res_3 = await client_3.POST('/auth/login/customer', {
            username: testCustomers[0].username,
            password: PASSWORD,
        });

        const res_4 = await client_4.POST('/auth/login/customer', {
            username: testCustomers[0].username,
            password: PASSWORD,
        });

        const json_1 = await res_1.json();
        const refreshToken_1 = res_1.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_1 = json_1.accessToken;
        const json_2 = await res_2.json();
        const refreshToken_2 = res_2.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_2 = json_2.accessToken;
        const json_3 = await res_3.json();
        const refreshToken_3 = res_3.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_3 = json_3.accessToken;
        const json_4 = await res_4.json();
        const refreshToken_4 = res_4.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_4 = json_4.accessToken;

        const userRefreshError = refreshToken_1 === refreshToken_2;
        const userAccessError = accessToken_1 === accessToken_2;
        const customerRefreshError = refreshToken_3 === refreshToken_4;
        const customerAccessError = accessToken_3 === accessToken_4;

        if (userRefreshError) {
            logger.error(`FAILED: Got same refresh token for two different clients of the same user`);
        }
        if (userAccessError) {
            logger.error(`FAILED: Got same access token for two different clients of the same user`);
        }
        if (!userRefreshError && !userAccessError) {
            logger.success(`SUCCESS: Connected two different clients of the same user with success`);
        }
        if (customerRefreshError) {
            logger.error(`FAILED: Got same refresh token for two different clients of the same customer`);
        }
        if (customerAccessError) {
            logger.error(`FAILED: Got same access token for two different clients of the same customer`);
        }
        if (!customerRefreshError && !customerAccessError) {
            logger.success(`SUCCESS: Connected two different clients of the same customer with success`);
        }

        client_1.setCookieToken(refreshToken_1);
        client_1.setBearerToken(accessToken_1);
        client_2.setCookieToken(refreshToken_2);
        client_2.setBearerToken(accessToken_2);
        client_3.setCookieToken(refreshToken_3);
        client_3.setBearerToken(accessToken_3);
        client_4.setCookieToken(refreshToken_4);
        client_4.setBearerToken(accessToken_4);

        // Logout client_1 once to revoke accessToken
        // Second logout to test token revokation as it is a protected route
        await client_1.GET('/auth/logout/user');
        const res_1_logout = await client_1.GET('/auth/logout/user');
        await client_3.GET('/auth/logout/customer');
        const res_3_logout = await client_3.GET('/auth/logout/customer');

        if (res_1_logout.status !== 401) {
            logger.error(`FAILED: Logout user by revoking accessToken with success`, res);
        } else {
            logger.success(`SUCCESS: Logout user by revoking accessToken with success`);
        }
        if (res_3_logout.status !== 401) {
            logger.error(`FAILED: Logout customer by revoking accessToken with success`, res);
        } else {
            logger.success(`SUCCESS: Logout customer by revoking accessToken with success`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
