import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { RequestService, RouteEntityCheck, SetUrl } from './types';
import { loginPrefix, logoutPrefix, protectedPrefix, refreshPrefix } from './utils';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('requestService')) return done();

    let url: string = undefined;
    const setUrl: SetUrl = requestUrl => (url = requestUrl);
    const isProtectedRoute: RouteEntityCheck = () => url.startsWith(protectedPrefix);
    const isRefreshRoute: RouteEntityCheck = () => url.startsWith(refreshPrefix);
    const isLoginRoute: RouteEntityCheck = () => url.startsWith(loginPrefix);
    const isLogoutRoute: RouteEntityCheck = () => url.startsWith(logoutPrefix);
    const isSwaggerRoute: RouteEntityCheck = () => url.startsWith('/swagger');

    fastify.decorate('requestService', {
        isProtectedRoute,
        isRefreshRoute,
        isLoginRoute,
        isLogoutRoute,
        isSwaggerRoute,
        setUrl,
        protectedPrefix,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        requestService: RequestService;
    }
}
