# Design Spec: Cloudflare Web Analytics

## Overview
Add privacy-friendly aggregate analytics to the static Next.js personal site using Cloudflare Web Analytics. The goal is to see site visits and blog article opens by URL path without identifying individual visitors.

## Decision
Use Cloudflare Web Analytics because it is free, privacy-first, works on static sites, and only requires a JavaScript beacon snippet. The site remains hosted on GitHub Pages and does not need Cloudflare DNS or proxying.

## Architecture
- Create a small server component in `app/analytics.tsx`.
- Read `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` at build time.
- If the token is missing, render nothing.
- If the token is present, render the Cloudflare beacon using `next/script` with `strategy="afterInteractive"`.
- Mount the component once from `app/layout.tsx` so homepage and blog routes are tracked.

## Data Captured
Cloudflare will report aggregate web analytics such as page views and visitors. Blog article opens are counted through page views on `/blog/...` paths.

## Privacy Boundary
This design does not add cookies, login, user profiles, per-person identity, or a local analytics dashboard. It only enables aggregate analytics collected by Cloudflare's hosted service.

## Configuration
The production build must define:

```bash
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<cloudflare-token>
```

The token is public because Cloudflare's browser snippet exposes it in the generated HTML. The component intentionally renders nothing when the token is absent, keeping local development clean.

## Verification Plan
1. Add tests that check the analytics component is gated by the env token and uses the Cloudflare beacon script.
2. Run the analytics test and confirm it fails before implementation.
3. Implement the component and layout integration.
4. Run the analytics test, site UI tests, lint, and build.
5. Update README setup instructions.
