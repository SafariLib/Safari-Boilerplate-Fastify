import type { BcryptPluginOpts } from '@dependencies/bcrypt';
import type { FastifyCookiePluginOpts } from '@dependencies/fastifyCookie';
import type { FastifyRateLimitPluginOpts } from '@dependencies/fastifyRateLimit';
import type { RedisPluginOpts } from '@dependencies/fastifyRedis';
import type { FastifySwaggerPluginOpts } from '@dependencies/fastifySwagger';
import type { FastifySwaggerUIPluginOpts } from '@dependencies/fastifySwaggerUI';
import type { JsonWebTokenPluginOpts } from '@dependencies/jsonwebtoken';
import type { PrismaPluginOpts } from '@dependencies/prisma';
import type { AuthorizationPluginOpts } from '@plugins/authorization';

const serverConfig: ServerConfig = {
    authorization: {
        maxAttempts: 5,
        min: 15,
    },
    bcrypt: {
        saltRounds: 10,
    },
    cookie: {
        secret: process.env.SECRET_COOKIE,
        serializeOpts: {
            signed: true,
            httpOnly: false,
            secure: true,
            sameSite: 'strict',
        },
    },
    jsonwebtoken: {
        algorithm: 'HS256',
        bearerToken: {
            name: 'bearerToken',
            secret: undefined,
            expiresIn: 1800000, // 30 minutes
        },
        refreshToken: {
            name: 'refreshToken',
            secret: undefined,
            expiresIn: 86400000, // 24 hours
        },
    },
    prisma: {
        clientOpts: {
            log: [{ level: 'query', emit: 'event' }],
        },
    },
    rateLimit: {
        global: true, // Apply to all routes
        max: 100, // Maximum requests allowed per IP address
        timeWindow: 1000, // Time window in milliseconds to count requests
        hook: 'onRequest' as const, // First hook in the request lifecycle to apply rate limiting
    },
    redis: {
        options: {
            url: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            closeClient: true,
        },
        namespaces: [],
    },
    swagger: {
        info: {
            title: 'Safari API',
            version: '3',
        },
        host: 'localhost',
        schemes: ['http'],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json'],
    },
    swaggerUI: {
        routePrefix: '/swagger',
        uiConfig: {
            docExpansion: 'list' as const,
            deepLinking: false,
            tryItOutEnabled: false,
        },
    },
};

interface ServerConfig {
    authorization: AuthorizationPluginOpts;
    bcrypt: BcryptPluginOpts;
    cookie: FastifyCookiePluginOpts;
    jsonwebtoken: JsonWebTokenPluginOpts;
    prisma: PrismaPluginOpts;
    rateLimit: FastifyRateLimitPluginOpts;
    redis: RedisPluginOpts;
    swagger: FastifySwaggerPluginOpts;
    swaggerUI: FastifySwaggerUIPluginOpts;
}

export default serverConfig;
