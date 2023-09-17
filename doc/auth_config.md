# Authentification configuration

Authentification strategy is based on Tokens. The library [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) is used to handle login and authorizations.

Update [jsonWebToken/plugin.ts](../src/plugins/jsonWebToken/plugin.ts) file to customize token configuration.

## Features

This API uses two tokens

-   **AccessToken**

    Handle authentication for a short amount of time.

-   **RefreshToken**

    Handle accessToken regeneration when expired.

Both tokens are protected by a secret randomly generated for each user. They can be revoked and thus users can logout one or all account securely.

## Accounts

There is two types of accounts:

-   **Admins**

    Admins accounts are used for administration panel connection.

    An admin has a _role_, this role is customizable and you can create has many roles as you need. Default roles are

    -   `"Super Administrateur"`
    -   `"Administrateur"`

    Role has permissions.

-   **Users**

    A user has a _role_, this role is customizable and you can create has many roles as you need. Default roles are

    -   `"Utilisateur"`

    Users accounts are used for client application.

You can find the SQL Query adding those rows in [20230917144853_add_default_field_for_roles](../prisma/migrations/20230917144853_add_default_field_for_roles/migration.sql) migration file.

## Public and protected routes

Protected routes are identified using prefixes:

-   `/protected/admin` for admin routes
-   `/protected` for user routes

This is checked with functions that you can find in [utils/routes.ts](../src/utils/publicRoutes.ts)

-   `isAdminLogoutRoute())`

    _Exceptions for admin logout routes_

-   `isUserLogoutRoute()`

    _Exceptions for user logout routes_

-   `isUserRefreshRoute()`
-   `isAdminRefreshRoute()`

    _Token refresh routes_

-   `isAdminProtectedRoute()`
-   `isUserProtectedRoute()`
