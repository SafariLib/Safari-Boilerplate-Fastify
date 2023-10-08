import { Prisma } from '@prisma/client';

export const orderColumns = ['u.id', 'u.username', 'u.email', 'u.revoked'];
export const dateFilters = ['created_after', 'created_before', 'updated_after', 'updated_before'];

export const defaultSelectUserQuery = Prisma.sql`
    SELECT
        u.id,
        u.username,
        u.email,
        u.avatar_url as "avatarUrl",
        u.revoked,
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        json_build_object('id', u.role_id, 'name', r.name) AS role
    FROM "User" u INNER JOIN "UserRole" r ON u.role_id = r.id
`;

export const defaultSelectAdminQuery = Prisma.sql`
    SELECT
        u.id,
        u.username,
        u.email,
        u.avatar_url as "avatarUrl",
        u.revoked,
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        json_build_object('id', u.role_id, 'name', r.name) AS role
    FROM "Admin" u INNER JOIN "AdminRole" r ON u.role_id = r.id
`;
