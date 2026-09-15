# AI Safety & Security Specification

## Security Boundaries & Defense Rules

1. **Session-Inferred Scoping**: The authenticated user ID is derived strictly from `req.auth!.userId`. The LLM cannot specify or override the target `userId`.
2. **Prompt Injection Defense**: User-generated content (task titles, notes, descriptions) is sanitized and wrapped in context structures so instructions embedded in user data cannot override system behavior.
3. **No Direct System Access**: No SQL execution, no file system access, no shell execution, no environment variable inspection.
4. **Secret Protection**: API keys and tokens are strictly server-side and never returned in API responses or stored in database logs.
