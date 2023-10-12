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

Authentication attempts are limited to 5 per 15 minutes based on the client Ip adress. This feature is handled in the server state and revoked ip adresses are lost on server reboot.
