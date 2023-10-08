import { Prisma } from '@prisma/client';
import type { Sql } from '@prisma/client/runtime/library';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

type BuildPaginatedQuery = (page: number, limit: number) => Sql;
type BuildOrderByQuery = (orderby: string, orderdir: 'ASC' | 'DESC', columns: Array<string>) => Sql;

export interface PaginatedQuery {
    orderby?: string;
    orderdir?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('queryService')) return done();
    const { sql, empty: sqlEmpty, join: sqlJoin } = Prisma;

    /**
     * Prepare the offset and limit for a paginated query
     * @param page The page number
     * @param limit The page limit
     * @throws PAGINATION_MALFORMED
     * @throws PAGINATION_LIMIT_EXCEEDED
     */
    const buildPaginatedQuery: BuildPaginatedQuery = (page, limit) => {
        if (page < 0 || limit < 0) throw { status: 400, errorCode: 'PAGINATION_MALFORMED' };
        if (limit > 100) throw { status: 400, errorCode: 'PAGINATION_LIMIT_EXCEEDED' };
        return sql`
            OFFSET ${page * limit}
            LIMIT ${limit}
        `;
    };

    /**
     * Prepare the order by clause for a paginated query
     * @param order The order object
     * @param columns array of columns to check
     * @throws ORDERBY_MALFORMED
     */
    const buildOrderByQuery: BuildOrderByQuery = (orderby, orderdir = 'ASC', columns) => {
        const value = columns.find(str => str.includes(orderby));
        if (!orderby) return sqlEmpty;
        if ((orderdir !== 'ASC' && orderdir !== 'DESC') || !value)
            throw { status: 400, errorCode: 'ORDERBY_MALFORMED' };

        // FIXME: Probably a better way to fix this
        if (orderdir === 'DESC') return sql`ORDER BY ${value} DESC`;
        else return sql`ORDER BY ${value} ASC`;
    };

    fastify.decorate('queryService', {
        buildPaginatedQuery,
        buildOrderByQuery,
    });
    done();
}) as FastifyPluginCallback);

interface QueryService {
    buildPaginatedQuery: BuildPaginatedQuery;
    buildOrderByQuery: BuildOrderByQuery;
}

declare module 'fastify' {
    interface FastifyInstance {
        queryService: QueryService;
    }
}
