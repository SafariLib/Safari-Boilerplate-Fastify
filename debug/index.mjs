import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    // -----------------------------
    //          AUTH TESTS
    // -----------------------------
    const authTests = [
        (await import('./tests/auth/test.login_success_call.mjs')).default,
        (await import('./tests/auth/test.login_fail_call.mjs')).default,
        (await import('./tests/auth/test.login_response_format_test.mjs')).default,
        (await import('./tests/auth/test.login_protected_routes.mjs')).default,
        (await import('./tests/auth/test.logout.mjs')).default,
        (await import('./tests/auth/test.refreshing_tokens.mjs')).default,
        (await import('./tests/auth/test.limited_login.mjs')).default,
    ];

    try {
        await prisma.$connect();
        for (const test of authTests) await test(prisma);
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
})();
