# Design Spec: GitHub Pages Deployment for mgb-web

## Overview
This specification describes the transition of the `mgb-web` Next.js project to a static export architecture suitable for hosting on GitHub Pages with a custom domain (`mgb.is-a.dev`).

## Architecture
- **Framework:** Next.js 15 (Static Export mode)
- **Deployment Platform:** GitHub Pages
- **Orchestration:** GitHub Actions
- **Package Manager:** pnpm

## Changes Required

### 1. Next.js Configuration (`next.config.mjs`)
Modify the configuration to enable static exports and handle image optimization in a serverless environment.
- Set `output: 'export'`.
- Set `images.unoptimized: true` (required for static exports as Next.js image optimization requires a running Node.js server).

### 2. GitHub Actions Workflow (`.github/workflows/nextjs.yml`)
Create a workflow that automates the build and deployment process.
- **Triggers:** Push to `main` branch.
- **Permissions:** 
  - `contents: read`
  - `pages: write`
  - `id-token: write`
- **Steps:**
  - Checkout repository.
  - Detect package manager (pnpm).
  - Setup Node.js.
  - Setup GitHub Pages.
  - Install dependencies (`pnpm install`).
  - Build project (`pnpm build`).
  - Upload build artifacts from the `out/` directory.
  - Deploy to GitHub Pages.

### 3. Custom Domain Support
- Ensure the `CNAME` file (currently in root) is preserved in the static export.
- Verify GitHub repository settings are configured for the custom domain `mgb.is-a.dev`.

## Verification Plan
1. **Manual Build Test:** Run `pnpm build` locally and verify the `out/` directory contains the expected HTML/CSS/JS files.
2. **Workflow Validation:** Push the changes to GitHub and monitor the "Actions" tab to ensure the build and deployment steps complete successfully.
3. **URL Verification:** Visit `https://mgb.is-a.dev` to confirm the site is live and all assets (styles, images) load correctly.
