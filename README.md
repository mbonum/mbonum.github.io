# Mirko Bonomi's Personal Site

Personal website built with Next.js 15, React 19, Tailwind CSS v4, and Motion.

Live site: [https://mgb.is-a.dev](https://mgb.is-a.dev)

## Features

- Minimal one-page portfolio layout
- Blog support with MDX
- Responsive and accessible design
- Content sync from a local CV and Obsidian vault (optional)

## Getting Started

```bash
git clone https://github.com/mbonum/mbonum.github.io.git
cd mbonum.github.io
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Content Sync (local)

To regenerate site content from your own CV and blog sources, set paths via environment variables and run the sync script:

```bash
export CV_PATH=/path/to/your/cv.md
export OBSIDIAN_PUBLIC_DIR=/path/to/your/public/notes
pnpm sync:content
pnpm build
```

Commit the generated files under `app/` before pushing if you want them published on GitHub Pages.

## Analytics

The site supports free, privacy-friendly aggregate analytics through Cloudflare Web Analytics. Create a Web Analytics site in Cloudflare, copy the beacon token, and add it as a GitHub repository variable:

```bash
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=your-cloudflare-token
```

When the token is missing, the analytics script is not rendered. Blog article opens appear in Cloudflare as page views for `/blog/...` paths.

## Deployment

Pushes to `main` build and deploy via GitHub Actions (`.github/workflows/nextjs.yml`). In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
