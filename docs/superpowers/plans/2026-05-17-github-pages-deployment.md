# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Next.js for static export and automate deployment to GitHub Pages using GitHub Actions.

**Architecture:** Modifies Next.js configuration to generate a static out directory and creates a GitHub Actions workflow to build and deploy this directory to GitHub Pages.

**Tech Stack:** Next.js 15, GitHub Actions, pnpm

---

### Task 1: Configure Next.js for Static Export

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Update `next.config.mjs`**

Modify the configuration to enable static exports and unoptimized images.

```javascript
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
        reactStrictMode: true,
        pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
        output: "export",
        images: {
                unoptimized: true,
        },
};

const withMDX = createMDX({
        extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
```

- [ ] **Step 2: Verify local build**

Run: `pnpm build`
Expected: Build completes successfully and generates an `out/` directory containing static files (HTML, CSS, JS).

- [ ] **Step 3: Commit Next.js configuration**

```bash
git add next.config.mjs
git commit -m "build: configure next.js for static export"
```

### Task 2: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/nextjs.yml`

- [ ] **Step 1: Create workflow file**

Create the GitHub Actions workflow definition for Next.js static export.

```yaml
# Sample workflow for building and deploying a Next.js site to GitHub Pages
#
# To get started with Next.js see: https://nextjs.org/docs/getting-started
#
name: Deploy Next.js site to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9
          
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
          
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          # Automatically inject basePath in your Next.js configuration file and disable
          # server side image optimization (https://nextjs.org/docs/api-reference/next/image#unoptimized).
          #
          # You may remove this line if you want to manage the configuration yourself.
          static_site_generator: next
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build with Next.js
        run: pnpm build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit workflow file**

```bash
git add .github/workflows/nextjs.yml
git commit -m "ci: add github actions workflow for pages deployment"
```
