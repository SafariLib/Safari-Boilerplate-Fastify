import apiCaller from '../../utils/apiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { CUTOMERS, PASSWORD, USERS, initData } from './utils.mjs';

export default async () => {
    logger.startTest('login');
    await initData();

    const testUsers = USERS.map(user => ({
        ...user,
        refreshToken: null,
        accessToken: null,
    }));

    const testCustomers = CUTOMERS.map(customer => ({
        ...customer,
        refreshToken: null,
        accessToken: null,
    }));

    // Login should be successfull
    for (const user of testUsers) {
        const response = await apiCaller.POST('/auth/login/user', {
            username: user.username,
            password: PASSWORD,
        });

        if (response.status !== 200) {
            logger.error(`Test for user ${user.username} login success has failed`, response);
        } else {
            console.info(`Test for user ${user.username} login success has passed`);
        }
    }
    for (const customer of testCustomers) {
        const response = await apiCaller.POST('/auth/login/customer', {
            username: customer.username,
            password: PASSWORD,
        });

        if (response.status !== 200) {
            logger.error(`Test for customer ${customer.username} login success has failed`, response);
        } else {
            console.info(`Test for customer ${customer.username} login success has passed`);
        }
    }

    // Login should fail
    for (const user of testUsers) {
        const response = await apiCaller.POST('/auth/login/user', {
            username: user.username,
            password: 'wrong password',
        });

        if (response.status !== 401) {
            logger.error(`Test for wrong password user login failure has failed`, response);
        } else {
            console.info(`Test for wrong password user login failure has passed`);
        }
    }
    for (const customer of testCustomers) {
        const response = await apiCaller.POST('/auth/login/customer', {
            username: customer.username,
            password: 'wrong password',
        });

        if (response.status !== 401) {
            logger.error(`Test for wrong password customer login failure has failed`, response);
        } else {
            console.info(`Test for wrong password customer login failure has passed`);
        }
    }
    for (const user of testUsers) {
        const response = await apiCaller.POST('/auth/login/user', {
            username:
                'wrongUsernameThatIsTooLong_____IMeanReallyTooLongLikeSoLongItCanTouchTheSky____EvenLongerThanThat',
            password: PASSWORD,
        });

        if (response.status !== 400) {
            logger.error(`Test for malformed login payload schema has failed`, response);
        } else {
            console.info(`Test for malformed login payload schema has passed`);
        }
    }
    // NOTE: Schema validation is shared between users and customers
    // Tests aren't duplicated for customers

    // TODO: Tests to finish
    /* 
        - Password shouldn't be in response
        - Refresh token should be in cookie
        - Access token should be in response


        Authorization: `Bearer ${testUsers[0].accessToken}`
        const jsonContent = await res.json();

        expect(jsonContent.user.password).toBeUndefined();
        expect(jsonContent.accessToken).toBeDefined();
        expect(res.cookies[0].name).toBe('refreshToken');

        user.accessToken = jsonContent.token;
        user.refreshToken =
            (res.cookies[0] as Record<string, string>).name +
                '=' +
                (res.cookies[0] as Record<string, string>).value;

    */

    logger.success('login');
};
