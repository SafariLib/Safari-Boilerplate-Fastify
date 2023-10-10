# API Error codes

List of all API error codes.
| Code | Description |
| ------------------------- | --------------------------------------------------------------------------- |
| `ORDERBY_MALFORMED` | Either "dir" entry does not match "ASC" or "DESC" or "by" does not exists in the table. |
| `FILTER_MALFORMED_DATE` | Provided date format is malformed. |
| `PAGINATION_LIMIT_EXCEEDED` | Pagination parameters exceeds server limitations. |
| `PAGINATION_MALFORMED` | Pagination parameters malformed. |
| `ENTITY_NOT_FOUND` | Requested entity not found. |
| `USER_NOT_FOUND` | User connection failed as provided credentials does not exists in database. |
| `USER_REVOKED` | User connection failed as user's state is currently **revoked**. |
| `USER_INCORRECT_PASSWORD` | User connection failed as provided password does not match. |
| `ADMIN_ACCESS_DENIED` | Current Administrator hasn't the correct rights to access this feature. |
| `AUTH_TOO_MANY_ATTEMPTS` | More than 5 failed login attempts in the last 15 minutes. |
| `AUTH_COOKIE_EMPTY` | Request authorization cookie is empty. |
| `AUTH_COOKIE_INVALID` | Request authorization cookie decryption failed. |
| `AUTH_TOKEN_EXPIRED` | Bearer token is expired. |
| `AUTH_TOKEN_REVOKED` | Bearer token is revoked. |
| `AUTH_TOKEN_INVALID` | Bearer token is malformed. |
| `AUTH_TOKEN_INVALID` | Bearer token is malformed. |

List of all API error codes.
| Code | Description |
| ------------------------- | --------------------------------------------------------------------------- |
| `ORDERBY_MALFORMED` | Either "dir" entry does not match "ASC" or "DESC" or "by" does not exists in the table. |
| `FILTER_MALFORMED_DATE` | Provided date format is malformed. |
| `PAGINATION_LIMIT_EXCEEDED` | Pagination parameters exceeds server limitations. |
| `PAGINATION_MALFORMED` | Pagination parameters malformed. |
| `ENTITY_NOT_FOUND` | Requested entity not found. |
| `USER_NOT_FOUND` | User connection failed as provided credentials does not exists in database. |
| `USER_REVOKED` | User connection failed as user's state is currently **revoked**. |
| `USER_INCORRECT_PASSWORD` | User connection failed as provided password does not match. |
| `ADMIN_ACCESS_DENIED` | Current Administrator hasn't the correct rights to access this feature. |

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
