import type { Sql } from '@prisma/client/runtime/library';

export type BuildPaginatedQuery = (page: number, limit: number) => Sql;
export type BuildOrderByQuery = (orderby: string, orderdir: 'ASC' | 'DESC', columns: Array<string>) => Sql;

export interface PaginatedQuery {
    orderby?: string;
    orderdir?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}
export interface QueryService {
    buildPaginatedQuery: BuildPaginatedQuery;
    buildOrderByQuery: BuildOrderByQuery;
}
