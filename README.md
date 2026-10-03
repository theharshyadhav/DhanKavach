# Dhan Kavach

Money-confidence app for first-time Indian investors: budget planner, decision studio, **Ask Kavach (Grok-powered tutor)**, **AI quiz arena**, calm-trading lab, rights and complaint builder, nominee tracker, read-aloud and voice input.

## Run
```
cp .env.example .env     # put your xAI key in XAI_API_KEY
export $(grep -v '^#' .env | xargs)
npm start                # http://localhost:3000 (Node 18+, no npm install needed)
```
Without a key the app still works in **offline demo mode** (built-in glossary answers and a sample quiz).

## Grok integration
- The browser never sees your key. `server.js` exposes `/api/chat` and `/api/quiz`, adds a fixed safety system prompt (education only, no tips or predictions), caps input size, and rate-limits each IP.
- Model: set `XAI_MODEL`. The default is `grok-4.3`; list what your key can use with `curl -H "Authorization: Bearer $XAI_API_KEY" https://api.x.ai/v1/models`.
- Quiz output is parsed and validated before it reaches the UI.

## Deploy on Vercel (no other host needed)
1. Push this folder to GitHub.
2. Vercel > Add New Project > import the repo. Framework preset: Other. Leave build settings empty.
3. Settings > Environment Variables: add `XAI_API_KEY` and `XAI_MODEL`. Redeploy.
`public/` is served as the site and `api/*.js` become serverless functions (`vercel.json` sets a 60s limit; check your plan's maximum). Note the rate limiter is in-memory, so on serverless it is per instance and only a light guard; add Vercel's firewall or Upstash rate limiting before a public launch.

## Other hosts
Render, Railway or Fly.io also work: start command `npm start`. Static-only hosts (GitHub Pages, Netlify without functions) show offline demo mode.

## Guardrails
Education only. No buy/sell signals, price predictions or personalised product picks; no monetisation. Budget data stays in the browser's localStorage, and only a savings rate and emergency-fund months are sent to the AI if the user ticks the box. AI answers can be wrong; the UI says so.

## Known gaps
Hindi UI covers navigation and home (AI replies follow the user's language). Add strings in the `TX` object in `public/index.html`.
