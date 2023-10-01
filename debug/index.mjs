import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    const authTests = [
        (await import('./tests/auth/test.login_success_call.mjs')).default,
        (await import('./tests/auth/test.login_fail_call.mjs')).default,
        (await import('./tests/auth/test.login_response_format_test.mjs')).default,
        (await import('./tests/auth/test.login_protected_routes.mjs')).default,
        (await import('./tests/auth/test.logout.mjs')).default,
        (await import('./tests/auth/test.refreshing_tokens.mjs')).default,
        (await import('./tests/auth/test.limited_login.mjs')).default,
    ];

    const userTests = [(await import('./tests/user/test.get_user.mjs')).default];

    try {
        await prisma.$connect();
        // for (const test of authTests) await test(prisma);
        for (const test of userTests) await test(prisma);
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
})();
