# Authentification configuration

Authentification strategy is based on Tokens. The library [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) is used to handle login and authorizations.

## Accounts

There is two types of accounts:

-   **Users**

    Users accounts are used for administration panel connection.

    A user has a _role_, this role is customizable and you can create has many roles as you need. Default roles are

    -   `"Super Admin" (num 0)`
    -   `"Admin" (num 1)`

    They have specific authorizations.

-   **Customers**

    Customers accounts are used for client application.

## Update tokens configuration

Base token configuration is handled in the [jsonWebToken/plugin.ts](../src/plugins/jsonWebToken/plugin.ts) file.

Update _sign/verify_ options objects in that file.

## Add public routes

Every routes are defaultly protected by token verification. There's an exception list for public routes.

Update **publicRoutes** array in [utils/publicRoutes.ts](../src/utils/publicRoutes.ts).
