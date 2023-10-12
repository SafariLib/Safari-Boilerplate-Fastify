# API Error codes

List of all API error codes.
| Code | Description |
| ------------------------- | --------------------------------------------------------------------------- |
| `ORDERBY_MALFORMED` | Either "dir" entry does not match "ASC" or "DESC" or "by" does not exists in the table. |
| `PAGINATION_MALFORMED` | Pagination parameters malformed. |
| `FILTER_MALFORMED_DATE` | Provided date format is malformed. |
| `ENTITY_NOT_FOUND` | Requested entity not found. |
| `ACCESS_DENIED` | Current User does not has access to this feature. |
| `AUTH_INVALID_CREDENTIALS` | Invalid connection payload. |
| `AUTH_TOO_MANY_ATTEMPTS` | More than 5 failed login attempts in the last 15 minutes. |
| `AUTH_USER_REVOKED` | User connection failed as user's state is currently **revoked**. |
| `AUTH_COOKIE_EMPTY` | Request authorization cookie is empty. |
| `AUTH_COOKIE_INVALID` | Request authorization cookie decryption failed. |
| `AUTH_HEADERS_EMPTY` | Authorization headers are empty. |
| `AUTH_TOKEN_EXPIRED` | Bearer token is expired. |
| `AUTH_TOKEN_REVOKED` | Bearer token is revoked. |
| `AUTH_TOKEN_INVALID` | Bearer token is malformed. |
