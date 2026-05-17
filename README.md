# Mirko Bonomi's Personal Site

Personal website of Mirko Bonomi, built with Next.js 15, React 19, Tailwind CSS v4, and Motion.

Live demo: [https://mgb.is-a.dev](https://mgb.is-a.dev)

## Features

- Minimal one-page portfolio layout.
- Blog support with MDX.
- Responsive and accessible design.
- Automated content sync from Obsidian and Markdown CV.

## Getting Started

```bash
git clone https://github.com/mbonum/mbonum.github.io.git
cd mbonum.github.io
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Content Sync

This site publishes committed static content generated from local writing sources:

- CV: `/home/mb/Documents/cv/cv.md`
- Obsidian public posts: `/home/mb/Documents/ObsidianVault/Public`

Run:

```bash
pnpm sync:content
pnpm build
```

Commit the generated files before pushing.
