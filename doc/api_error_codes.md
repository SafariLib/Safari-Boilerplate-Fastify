# API Error codes

List of all API error codes.
| Code | Description |
| ------------------------- | --------------------------------------------------------------------------- |
| `USER_NOT_FOUND` | User connection failed as provided credentials does not exists in database. |
| `USER_REVOKED` | User connection failed as user's state is currently **revoked**. |
| `USER_INCORRECT_PASSWORD` | User connection failed as provided password does not match. |
| `USER_NO_USERNAME_PROVIDED` | User connection failed as username is missing from body. |
| `USER_NO_PASSWORD_PROVIDED` | User connection failed as password is missing from body. |
