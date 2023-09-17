# API Error codes

List of all API error codes.
| Code | Description |
| ------------------------- | --------------------------------------------------------------------------- |
| `USER_NOT_FOUND` | User connection failed as provided credentials does not exists in database. |
| `USER_REVOKED` | User connection failed as user's state is currently **revoked**. |
| `USER_INCORRECT_PASSWORD` | User connection failed as provided password does not match. |
| `AUTH_HEADERS_EMPTY` | Request authorization headers are empty. |
| `AUTH_COOKIE_EMPTY` | Request authorization cookie is empty. |
| `AUTH_COOKIE_INVALID` | Request authorization cookie decryption failed. |
| `AUTH_TOKEN_EXPIRED` | Bearer token is expired. |
| `AUTH_TOKEN_REVOKED` | Bearer token is revoked. |
| `AUTH_TOKEN_INVALID` | Bearer token is malformed. |
