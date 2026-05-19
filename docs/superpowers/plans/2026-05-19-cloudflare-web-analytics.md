# Cloudflare Web Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add free, privacy-friendly aggregate analytics for the homepage and blog article opens.

**Architecture:** A focused `app/analytics.tsx` component renders the Cloudflare beacon only when `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is configured. `app/layout.tsx` mounts it once so every exported route is tracked.

**Tech Stack:** Next.js static export, React server components, `next/script`, Node test runner.

---

## File Structure
- Create `app/analytics.tsx`: single responsibility for Cloudflare Web Analytics script rendering.
- Modify `app/layout.tsx`: import and render `<Analytics />` once inside `<body>`.
- Modify `scripts/site-ui.test.mjs`: add file-level assertions for the integration.
- Modify `README.md`: document Cloudflare setup and the env variable.

### Task 1: Failing analytics integration test

**Files:**
- Modify: `scripts/site-ui.test.mjs`

- [ ] **Step 1: Add the failing test**

```js
test("root layout mounts token-gated Cloudflare Web Analytics", async () => {
	const analytics = await readFile("app/analytics.tsx", "utf8");
	const layout = await readFile("app/layout.tsx", "utf8");

	assert.match(analytics, /NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
	assert.match(analytics, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
	assert.match(analytics, /data-cf-beacon/);
	assert.match(analytics, /strategy="afterInteractive"/);
	assert.match(layout, /import \{ Analytics \} from ['"]\.\/analytics['"]/);
	assert.match(layout, /<Analytics \/>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:content && node --test scripts/site-ui.test.mjs`

Expected: FAIL because `app/analytics.tsx` does not exist or layout does not import it.

### Task 2: Analytics component and layout integration

**Files:**
- Create: `app/analytics.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Implement `app/analytics.tsx`**

```tsx
import Script from 'next/script'

const cloudflareAnalyticsToken =
  process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN

export function Analytics() {
  if (!cloudflareAnalyticsToken) {
    return null
  }

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })}
      strategy="afterInteractive"
    />
  )
}
```

- [ ] **Step 2: Mount the component in `app/layout.tsx`**

```tsx
import { Analytics } from './analytics'
```

Render `<Analytics />` inside `<body>` after the existing `ThemeProvider`.

- [ ] **Step 3: Run tests and vet**

Run: `node --test scripts/site-ui.test.mjs`

Expected: PASS.

Run: `vet "Add free Cloudflare Web Analytics gated by NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN"`

Expected: no high-confidence issues.

### Task 3: Documentation and full verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add README setup instructions**

Add an "Analytics" section explaining Cloudflare Web Analytics, `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, and that blog article opens appear as page views for `/blog/...` paths.

- [ ] **Step 2: Verify all relevant checks**

Run:

```bash
pnpm test:content
node --test scripts/site-ui.test.mjs
pnpm lint
pnpm build
```

Expected: all commands pass.

- [ ] **Step 3: Run vet**

Run: `vet "Document and verify free Cloudflare Web Analytics setup"`

Expected: no high-confidence issues.

## Self-Review
- Spec coverage: The plan covers token-gated script rendering, global layout mounting, blog article path tracking, and README setup.
- Placeholder scan: No placeholders remain.
- Type consistency: `Analytics` is exported from `app/analytics.tsx` and imported from `./analytics` in `app/layout.tsx`.
