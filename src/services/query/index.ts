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

    /**
     * Prepare the offset and limit for a paginated query
     * @param page The page number
     * @param limit The page limit
     * @throws PAGINATION_MALFORMED
     * @throws PAGINATION_LIMIT_EXCEEDED
     */
    const buildPaginatedQuery: BuildPaginatedQuery = (page, limit) => {
        if (page < 1 || limit < 0) throw { status: 400, errorCode: 'PAGINATION_MALFORMED' };
        if (limit > 100) throw { status: 400, errorCode: 'PAGINATION_LIMIT_EXCEEDED' };
        return Prisma.sql`
            OFFSET ${(page - 1) * limit}
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
        if (!orderby) return Prisma.empty;
        if ((orderdir !== 'ASC' && orderdir !== 'DESC') || !value)
            throw { status: 400, errorCode: 'ORDERBY_MALFORMED' };

        const [preparedValue, preparedDirection] = [Prisma.sql([value]), Prisma.sql([orderdir])];
        return Prisma.sql`ORDER BY ${preparedValue} ${preparedDirection}`;
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
