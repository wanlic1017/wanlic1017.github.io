# Haerenga Site

Haerenga is a Vite + React + TypeScript app backed by Firebase Auth, Firestore,
and Firebase Cloud Functions. The repository also includes small local scripts
for preparing and uploading question data.

## Project Structure

- `src/`: main web app
- `functions/`: Firebase Cloud Functions for quota checks, Stripe checkout, and billing portal flows
- `data/`: question JSON sources used by the local upload/upgrade scripts
- `public/`: static assets

## Local Development

Install dependencies in both app layers:

```bash
npm install
cd functions && npm install
```

Start the front-end:

```bash
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
```

## Environment Setup

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

Front-end runtime values:

- `VITE_APP_URL`: canonical app URL used in auth action links
- `VITE_FUNCTIONS_BASE_URL`: base URL for deployed HTTP functions
- `VITE_FIREBASE_*`: Firebase web app configuration

Note: Firebase web config is public by design, but it still helps to keep it in
environment files so staging/production can diverge cleanly.

Security note:

- do not hardcode Firebase web config fallbacks in `src/`
- do not commit real production values to `.env.example`
- any true secret such as Stripe secret keys or OpenAI API keys must live only
  in server-side secrets / local env, never in browser code
- Cloud Functions checkout config should also come from env / Firebase params,
  not hardcoded Stripe price fallbacks in source

Required server-side config before deploying functions:

- `APP_URL`
- `APP_ALLOWED_ORIGINS`
- `APP_CHECK_ENFORCED`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- either `STRIPE_PRICE_MAP_JSON` or the individual `STRIPE_*_PRICE_ID` params

Recommended values:

- `APP_ALLOWED_ORIGINS`: comma-separated allowed browser origins, for example
  `https://haerenganz.com,http://localhost:5173`
- `APP_CHECK_ENFORCED`: set to `true` only after Firebase App Check is enabled
  in the console and the front-end `VITE_FIREBASE_APPCHECK_SITE_KEY` is set

## Firebase

Current Firebase project alias:

- default project: `haerenganz-app`

Firestore config files now live in the repo:

- `firestore.rules`
- `firestore.indexes.json`

Cloud Functions live in `functions/index.js` and currently handle:

- usage/quota reads and increments
- Stripe checkout session creation
- Stripe webhook processing
- Stripe billing portal session creation

Recommended operational follow-up:

- document required Firebase secrets for functions deployment
- separate staging vs production config before adding more environments
- tighten `users` write rules once quota/profile mutations are moved fully behind functions

## Stripe / Functions Secrets

The functions code expects Firebase-managed secrets for Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Set those in Firebase before deploying functions.

## Data Scripts

Root scripts currently available:

```bash
npm run add-protips
npm run upgrade-explanations
node uploadQuestions.js all
```

There are also direct admin scripts such as `uploadQuestions.js` and
`deleteQuestions.js` that expect a local `serviceAccountKey.json`. That file is
gitignored and should never be committed.

## Deployment Notes

Front-end build:

```bash
npm run build
```

Functions deploy:

```bash
cd functions
npm run deploy
```

Firestore rules and indexes deploy with standard Firebase deploy commands from the
repo root, for example:

```bash
firebase deploy --only firestore
```
