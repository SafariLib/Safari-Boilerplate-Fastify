(async () => {
    const login_success_call = (await import('./tests/auth/test.login_success_call.mjs')).default;
    const login_fail_call = (await import('./tests/auth/test.login_fail_call.mjs')).default;
    const login_response_format_test = (await import('./tests/auth/test.login_response_format_test.mjs')).default;
    const login_protected_routes = (await import('./tests/auth/test.login_protected_routes.mjs')).default;
    const logout = (await import('./tests/auth/test.logout.mjs')).default;
    const refreshing_tokens = (await import('./tests/auth/test.refreshing_tokens.mjs')).default;
    const limited_login = (await import('./tests/auth/test.limited_login.mjs')).default;

    // -----------------------------
    //          AUTH TESTS
    // -----------------------------
    await login_success_call();
    await login_fail_call();
    await login_response_format_test();
    await login_protected_routes();
    await logout();
    await refreshing_tokens();
    await limited_login();
})();
