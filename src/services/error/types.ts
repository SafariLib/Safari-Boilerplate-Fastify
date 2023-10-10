export type APIErrorCode =
    | 'ACCESS_DENIED'
    | 'AUTH_INVALID_CREDENTIALS'
    | 'AUTH_TOO_MANY_ATTEMPTS'
    | 'AUTH_USER_REVOKED'
    | 'AUTH_HEADERS_EMPTY'
    | 'AUTH_COOKIE_EMPTY'
    | 'AUTH_COOKIE_INVALID'
    | 'AUTH_TOKEN_EXPIRED'
    | 'AUTH_TOKEN_REVOKED'
    | 'AUTH_TOKEN_INVALID';

export type ThrowAPIError = (message: APIErrorCode) => never;

export interface ErrorService {
    notFound: ThrowAPIError;
    unauthorized: ThrowAPIError;
    forbidden: ThrowAPIError;
    badRequest: ThrowAPIError;
    conflict: ThrowAPIError;
    internalServerError: ThrowAPIError;
    serviceUnavailable: ThrowAPIError;
    tooManyRequests: ThrowAPIError;
}
