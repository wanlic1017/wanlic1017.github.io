# TODO

## Security Review

Focus areas for vibe-coded apps:
- Hardcoded credentials, API keys, or tokens in source files
- Environment variable handling and `.env` exposure
- Secrets accidentally committed to git history
- Client-side code exposing sensitive logic or keys that should be server-side
- Misconfigured CORS, CSP, or other HTTP security headers
- Dependency vulnerabilities (`npm audit`)
