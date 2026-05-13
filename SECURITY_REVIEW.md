# Security Review — `bp-review` branch

Date: 2026-04-25

## 1. Exposed Firebase API Key in Deployed Bundle

**Severity: HIGH**
**Location:** `gh-pages` branch — `assets/index-PviPpjpZ.js` (and all prior deploy bundles)

The Firebase API key `AIza...` is embedded in the publicly served JS bundle on the live site (`haerenganz.com`). The bundle also includes full Firebase Auth and Firestore SDKs, confirming these services are in active use.

**Risk:** A Firebase Web API key is not secret by design, but it is the first factor in accessing your Firebase project. Without strict Firebase Security Rules on Firestore and Storage, anyone with the key can read/write data. The key also enables abuse of Firebase Auth (e.g. bulk account creation, email enumeration).

**Recommendation:**
- Audit your Firestore and Firebase Storage security rules immediately — verify they enforce authentication and authorisation, not just `allow read, write: if true`
- Enable [Firebase App Check](https://firebase.google.com/docs/app-check) to restrict API usage to your domain only
- In the Firebase Console, restrict the API key to your domain (`haerenganz.com`) under APIs & Services → Credentials

---

## 2. `.env` Files Not Covered by `.gitignore`

**Severity: MEDIUM**
**Location:** `.gitignore`

The `.gitignore` only covers `*.local` (e.g. `.env.local`). Plain `.env`, `.env.production`, and `.env.development` files are **not ignored** and would be committed if created. Vite uses all of these by convention.

**Recommendation:** Add to `.gitignore`:
```
.env
.env.*
!.env.example
```

---

## 3. Vulnerable Dependencies

**Severity: HIGH** (Vite) / **MEDIUM** (PostCSS)

`npm audit` reports:

| Package | Severity | Issue |
|---|---|---|
| `vite 8.0.0–8.0.4` | **High** | Path traversal in optimised deps `.map` handling; `server.fs.deny` bypass; arbitrary file read via dev server WebSocket ([GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9), [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r), [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583)) |
| `postcss <8.5.10` | Moderate | XSS via unescaped `</style>` in CSS stringify output ([GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)) |

The Vite vulnerabilities are dev-server only (not exploitable in production builds), but anyone who runs `npm run dev` on a shared or untrusted network is exposed.

**Recommendation:** Run `npm audit fix` — fixes are available for both.

---

## Summary

| # | Issue | Severity | Action |
|---|---|---|---|
| 1 | Firebase API key exposed + no App Check / rule audit | HIGH | Audit Security Rules, enable App Check, restrict key |
| 2 | `.env` files not gitignored | MEDIUM | Update `.gitignore` |
| 3 | Vite path traversal / file read (dev server) | HIGH | `npm audit fix` |
| 4 | PostCSS XSS in CSS output | MODERATE | `npm audit fix` |

---

# Code-Level Review

## XSS — No risk in current source
React escapes all JSX interpolations by default. Every value from `subjects.ts` is rendered via `{variable}` syntax — no `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`. No XSS risk in the current source.

## Injection — No attack surface
No SQL, no shell commands, no template engines, no user input reaching any sink. All data is static and hardcoded. No injection risk.

## CORS — Not applicable yet
CORS is a server-side configuration. This app has no backend. When a backend is added (Firebase or otherwise), CORS rules on that service will matter.

---

## 5. No Content Security Policy (CSP)

**Severity: MEDIUM**
**Location:** `index.html`

There is no `Content-Security-Policy` header or `<meta>` tag equivalent. A CSP is the primary defence against XSS if it is ever introduced — it restricts which scripts, styles, and resources the browser will load.

GitHub Pages doesn't allow custom HTTP headers, so a `<meta>` tag is the only option here. A reasonable starting policy:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com;">
```

Note: Tailwind's inline styles require `'unsafe-inline'` in `style-src` unless a nonce-based approach is used.

---

## 6. URL params used without validation — future backend risk

**Severity: LOW**
**Location:** `src/pages/ModulePage.tsx:7`

```tsx
const { subjectSlug, moduleSlug } = useParams();
const data = subjectSlug && moduleSlug ? getModuleBySlugs(subjectSlug, moduleSlug) : null;
```

The slugs from the URL are passed directly to `getModuleBySlugs`, which does a safe `.find()` against static data — no current risk. However, there is no length cap or character validation. If these slugs are ever forwarded to a backend query or used to construct a file path, this becomes a meaningful injection vector.

**Recommendation:** When a backend is added, validate slugs against the known allowlist before using them server-side.

---

## 7. Missing `rel="noopener noreferrer"` pattern for future external links

**Severity: LOW**
**Location:** `src/pages/ModulePage.tsx:67`

The "Get access" button is currently a non-functional `<button>`. When it is wired up to an external payment provider, the link should include `rel="noopener noreferrer"` to prevent tab-napping and referrer leakage.

---

## 8. Page title exposes internal project name

**Severity: INFO**
**Location:** `index.html:8`

```html
<title>haerenga-site</title>
```

This is the raw Vite template name and reveals the internal repo name in browser tabs and history. Should be updated to `Haerenga` before launch.

---

## Full Summary

| # | Issue | Severity | Action |
|---|---|---|---|
| 1 | Firebase API key exposed + no App Check / rule audit | HIGH | Audit Security Rules, enable App Check, restrict key |
| 2 | `.env` files not gitignored | MEDIUM | Update `.gitignore` |
| 3 | Vite path traversal / file read (dev server) | HIGH | `npm audit fix` |
| 4 | PostCSS XSS in CSS output | MODERATE | `npm audit fix` |
| 5 | No Content Security Policy | MEDIUM | Add CSP `<meta>` tag to `index.html` |
| 6 | URL params not validated (future backend risk) | LOW | Validate slugs server-side when backend is added |
| 7 | Missing `rel="noopener noreferrer"` on future external links | LOW | Add when payment links are wired up |
| 8 | Page title exposes internal repo name | INFO | Update `<title>` in `index.html` |
