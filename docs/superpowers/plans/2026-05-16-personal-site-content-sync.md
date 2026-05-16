# Personal Site Content Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local `pnpm sync:content` workflow that turns Mirko Bonomi's CV Markdown and Obsidian Public notes into committed static Next.js content.

**Architecture:** Put parsing and rendering logic in a small dependency-free Node library, expose it through a CLI sync script, and consume generated TypeScript data from the existing Next app. Blog notes are generated as normal `app/blog/<slug>/page.mdx` filesystem routes so GitHub Pages does not need access to local vault paths.

**Tech Stack:** Next.js App Router, MDX filesystem routes, TypeScript, Node 20 built-in `node:test`, `fs/promises`, and `path`.

---

## File Structure

- Create `scripts/content-sync-lib.mjs`: pure parsing/rendering helpers for CV sections, frontmatter, slugging, blog metadata, generated TypeScript, and MDX page output.
- Create `scripts/content-sync.test.mjs`: Node built-in tests for slugging, frontmatter, blog metadata fallback, and CV parsing.
- Create `scripts/sync-content.mjs`: CLI that reads `/home/mb/Documents/cv/cv.md` and `/home/mb/Documents/ObsidianVault/Public`, then writes generated files.
- Create `app/generated-content.ts`: generated content module committed to the repo so the site builds before and after sync.
- Modify `app/data.ts`: keep explicit site config/social links and re-export generated CV/blog content.
- Modify `app/page.tsx`: hide empty project sections and render generated skills and education sections.
- Modify `package.json`: add `sync:content` and `test:content` scripts.

## Task 1: Content Sync Library

**Files:**
- Create: `scripts/content-sync-lib.mjs`
- Test: `scripts/content-sync.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/content-sync.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
	extractBlogMetadata,
	parseCv,
	parseFrontmatter,
	slugify,
} from "./content-sync-lib.mjs";

test("slugify converts filenames to stable URL slugs", () => {
	assert.equal(slugify("About My Work.md"), "about-my-work");
	assert.equal(slugify("AI & QA: Notes!"), "ai-qa-notes");
});

test("parseFrontmatter returns metadata and body", () => {
	const parsed = parseFrontmatter(`---
title: Custom Title
description: Custom description
date: 2026-05-16
---

# Body Title

Body text.`);

	assert.deepEqual(parsed.data, {
		title: "Custom Title",
		description: "Custom description",
		date: "2026-05-16",
	});
	assert.match(parsed.body, /# Body Title/);
});

test("extractBlogMetadata uses frontmatter first and inferred fallbacks second", () => {
	const withFrontmatter = extractBlogMetadata({
		filename: "About My Work.md",
		content: `---
title: Public Work
description: Notes on work
date: 2026-05-16
---

# Ignored Heading

First paragraph.`,
		mtime: new Date("2026-01-02T00:00:00Z"),
	});

	assert.equal(withFrontmatter.title, "Public Work");
	assert.equal(withFrontmatter.description, "Notes on work");
	assert.equal(withFrontmatter.slug, "about-my-work");
	assert.equal(withFrontmatter.date, "2026-05-16");

	const inferred = extractBlogMetadata({
		filename: "About My Work.md",
		content: `# About My Work

Orient the reader in 30-60 seconds.`,
		mtime: new Date("2026-01-02T00:00:00Z"),
	});

	assert.equal(inferred.title, "About My Work");
	assert.equal(inferred.description, "Orient the reader in 30-60 seconds.");
	assert.equal(inferred.slug, "about-my-work");
	assert.equal(inferred.date, "2026-01-02");
});

test("parseCv extracts summary, work, education, and skills", () => {
	const cv = `**SUMMARY**

Fast-learning software engineer.

---

**WORK EXPERIENCE**

**QA Automation Engineer**, DonTouch SA, Chiasso/2026-present

- Develop and maintain integration tests
- Identify bugs

**Software Engineer**, Alma Iura, Verona/2025-03/2026

Developed a CLM platform.

---

**EDUCATION**

**University of Gothenburg** Sweden

Master of Science in Knowledge-based Entrepreneurship-2022

---

**SKILLS**

- Languages: English and Italian.
- Tech stack: Python, TypeScript, React.
`;

	const parsed = parseCv(cv);

	assert.equal(parsed.summary, "Fast-learning software engineer.");
	assert.equal(parsed.workExperience.length, 2);
	assert.equal(parsed.workExperience[0].title, "QA Automation Engineer");
	assert.equal(parsed.workExperience[0].company, "DonTouch SA");
	assert.equal(parsed.workExperience[1].start, "2025-03");
	assert.equal(parsed.workExperience[1].end, "2026");
	assert.equal(parsed.education.length, 1);
	assert.equal(parsed.skills.length, 2);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:content`

Expected: FAIL because `test:content` and `scripts/content-sync-lib.mjs` do not exist yet.

- [ ] **Step 3: Implement the library**

Create `scripts/content-sync-lib.mjs`:

```js
const GENERATED_NOTICE = "Generated by pnpm sync:content. Do not edit manually.";

export function slugify(value) {
	return value
		.replace(/\.[^.]+$/, "")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function parseFrontmatter(content) {
	if (!content.startsWith("---\n")) {
		return { data: {}, body: content };
	}

	const end = content.indexOf("\n---", 4);
	if (end === -1) {
		return { data: {}, body: content };
	}

	const raw = content.slice(4, end).trim();
	const body = content.slice(end + 4).replace(/^\n+/, "");
	const data = {};

	for (const line of raw.split("\n")) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!match) {
			continue;
		}
		const [, key, rawValue] = match;
		data[key] = rawValue.replace(/^["']|["']$/g, "").trim();
	}

	return { data, body };
}

function firstHeading(markdown) {
	const match = markdown.match(/^#\s+(.+)$/m);
	return match?.[1]?.trim();
}

function firstParagraph(markdown) {
	return (
		markdown
			.split(/\n{2,}/)
			.map((block) => block.trim())
			.find((block) => {
				return (
					block &&
					!block.startsWith("#") &&
					!block.startsWith("```") &&
					!block.startsWith(">") &&
					!block.startsWith("- ") &&
					!block.startsWith("---")
				);
			}) ?? ""
	);
}

function isoDate(date) {
	return date.toISOString().slice(0, 10);
}

export function extractBlogMetadata({ filename, content, mtime }) {
	const { data, body } = parseFrontmatter(content);
	const fallbackTitle = firstHeading(body) ?? filename.replace(/\.[^.]+$/, "");
	const slug = data.slug ? slugify(data.slug) : slugify(filename);

	return {
		title: data.title || fallbackTitle,
		description: data.description || firstParagraph(body),
		date: data.date || isoDate(mtime),
		slug,
		body,
	};
}

function sectionAfter(markdown, heading) {
	const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = markdown.match(
		new RegExp(`\\*\\*${escaped}\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n---\\n|$)`, "i"),
	);
	return match?.[1]?.trim() ?? "";
}

function compactLines(value) {
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export function parseCv(markdown) {
	const summary = sectionAfter(markdown, "SUMMARY").replace(/\s+/g, " ").trim();
	const work = sectionAfter(markdown, "WORK EXPERIENCE");
	const education = sectionAfter(markdown, "EDUCATION");
	const skills = sectionAfter(markdown, "SKILLS");

	return {
		summary,
		workExperience: parseWorkExperience(work),
		education: parseEducation(education),
		skills: compactLines(skills).map((line) => line.replace(/^- /, "")),
	};
}

function parseWorkExperience(section) {
	const entries = section
		.split(/\n(?=\*\*[^*]+\*\*,)/)
		.map((entry) => entry.trim())
		.filter(Boolean);

	return entries.map((entry, index) => {
		const lines = entry.split("\n");
		const header = lines[0];
		const match = header.match(/^\*\*(.+?)\*\*,\s*(.+?),\s*(.+)$/);
		const [, title = "", company = "", rawPeriod = ""] = match ?? [];
		const [locationPart = "", ...periodParts] = rawPeriod.split("/");
		const location = periodParts.length > 0 ? locationPart : "";
		const period = periodParts.length > 0 ? periodParts.join("/") : locationPart;
		const range = period.includes("/")
			? period.split("/", 2)
			: period.match(/^(.+?)-(present|\d{4}(?:-\d{2})?)$/i)?.slice(1, 3) ?? [
					period,
					"",
				];
		const [start = "", end = ""] = range;
		const description = lines
			.slice(1)
			.join("\n")
			.replace(/\n+/g, "\n")
			.trim();

		return {
			id: `work-${index + 1}`,
			title: title.trim(),
			company: company.trim(),
			location: location.trim(),
			start: start.trim(),
			end: end.trim() || "Present",
			description,
			link: "#",
		};
	});
}

function parseEducation(section) {
	const lines = compactLines(section);
	const entries = [];

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const school = line.match(/^\*\*(.+?)\*\*(.*)$/);
		if (!school) {
			continue;
		}
		entries.push({
			id: `education-${entries.length + 1}`,
			school: school[1].trim(),
			location: school[2].trim(),
			detail: lines[index + 1] ?? "",
		});
	}

	return entries;
}

export function renderGeneratedContent({ cv, posts }) {
	return `// ${GENERATED_NOTICE}

export const PROFILE = ${JSON.stringify({ summary: cv.summary }, null, 2)} as const;

export const GENERATED_WORK_EXPERIENCE = ${JSON.stringify(cv.workExperience, null, 2)} as const;

export const GENERATED_EDUCATION = ${JSON.stringify(cv.education, null, 2)} as const;

export const GENERATED_SKILLS = ${JSON.stringify(cv.skills, null, 2)} as const;

export const GENERATED_BLOG_POSTS = ${JSON.stringify(
		posts.map((post, index) => ({
			title: post.title,
			description: post.description,
			link: `/blog/${post.slug}`,
			uid: `blog-${index + 1}`,
			date: post.date,
		})),
		null,
		2,
	)} as const;
`;
}

export function renderBlogPage(post) {
	return `export const metadata = {
  title: ${JSON.stringify(post.title)},
  description: ${JSON.stringify(post.description)},
  alternates: {
    canonical: "/blog/${post.slug}",
  },
};

${post.body.trim()}
`;
}

export { GENERATED_NOTICE };
```

- [ ] **Step 4: Add the package test script**

Modify `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test:content": "node --test scripts/content-sync.test.mjs"
}
```

- [ ] **Step 5: Run tests and fix parser defects**

Run: `pnpm test:content`

Expected: PASS with four passing tests.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add package.json scripts/content-sync-lib.mjs scripts/content-sync.test.mjs
git commit -m "test: cover content sync parsing"
```

## Task 2: Sync CLI and Generated Content

**Files:**
- Create: `scripts/sync-content.mjs`
- Create: `app/generated-content.ts`
- Modify: `package.json`

- [ ] **Step 1: Create the CLI**

Create `scripts/sync-content.mjs`:

```js
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	extractBlogMetadata,
	GENERATED_NOTICE,
	parseCv,
	renderBlogPage,
	renderGeneratedContent,
} from "./content-sync-lib.mjs";

const repoRoot = process.cwd();
const cvPath = process.env.CV_PATH ?? "/home/mb/Documents/cv/cv.md";
const blogSourceDir =
	process.env.OBSIDIAN_PUBLIC_DIR ?? "/home/mb/Documents/ObsidianVault/Public";
const blogOutputDir = path.join(repoRoot, "app/blog");
const generatedContentPath = path.join(repoRoot, "app/generated-content.ts");

async function readBlogPosts() {
	const entries = await readdir(blogSourceDir, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
		.map((entry) => entry.name)
		.sort((a, b) => a.localeCompare(b));

	const posts = [];
	for (const filename of files) {
		const sourcePath = path.join(blogSourceDir, filename);
		const [content, fileStat] = await Promise.all([
			readFile(sourcePath, "utf8"),
			stat(sourcePath),
		]);
		posts.push(extractBlogMetadata({ filename, content, mtime: fileStat.mtime }));
	}

	return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function removeGeneratedBlogPosts() {
	const entries = await readdir(blogOutputDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const pagePath = path.join(blogOutputDir, entry.name, "page.mdx");
		let content = "";
		try {
			content = await readFile(pagePath, "utf8");
		} catch {
			continue;
		}

		if (content.includes(GENERATED_NOTICE)) {
			await rm(path.join(blogOutputDir, entry.name), { recursive: true, force: true });
		}
	}
}

async function writeBlogPosts(posts) {
	await removeGeneratedBlogPosts();

	for (const post of posts) {
		const outputDir = path.join(blogOutputDir, post.slug);
		await mkdir(outputDir, { recursive: true });
		await writeFile(
			path.join(outputDir, "page.mdx"),
			`{/* ${GENERATED_NOTICE} */}\n\n${renderBlogPage(post)}`,
		);
	}
}

async function main() {
	const [cvMarkdown, posts] = await Promise.all([readFile(cvPath, "utf8"), readBlogPosts()]);
	const cv = parseCv(cvMarkdown);

	await writeFile(generatedContentPath, renderGeneratedContent({ cv, posts }));
	await writeBlogPosts(posts);

	console.log(`Synced ${posts.length} blog post(s) from ${blogSourceDir}`);
	console.log(`Synced CV content from ${cvPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
```

- [ ] **Step 2: Add the sync script**

Modify `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test:content": "node --test scripts/content-sync.test.mjs",
  "sync:content": "node scripts/sync-content.mjs"
}
```

- [ ] **Step 3: Generate content**

Run: `pnpm sync:content`

Expected:

```text
Synced 1 blog post(s) from /home/mb/Documents/ObsidianVault/Public
Synced CV content from /home/mb/Documents/cv/cv.md
```

- [ ] **Step 4: Verify generated files exist**

Run: `rtk rg -n "Generated by pnpm sync:content|About My Work|Fast-learning" app/generated-content.ts app/blog`

Expected: output includes `app/generated-content.ts` and `app/blog/about-my-work/page.mdx`.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add package.json scripts/sync-content.mjs app/generated-content.ts app/blog/about-my-work/page.mdx
git commit -m "feat: sync CV and Obsidian content"
```

## Task 3: Consume Generated CV and Blog Data

**Files:**
- Modify: `app/data.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update data exports**

Modify `app/data.ts` so generated CV and blog data are the source for homepage content:

```ts
import {
	GENERATED_BLOG_POSTS,
	GENERATED_EDUCATION,
	GENERATED_SKILLS,
	GENERATED_WORK_EXPERIENCE,
	PROFILE,
} from "./generated-content";

type Project = {
	name: string;
	description: string;
	link: string;
	video: string;
	id: string;
};

type SocialLink = {
	label: string;
	link: string;
};

export const SUMMARY = PROFILE.summary;
export const PROJECTS: Project[] = [];
export const WORK_EXPERIENCE = GENERATED_WORK_EXPERIENCE;
export const EDUCATION = GENERATED_EDUCATION;
export const SKILLS = GENERATED_SKILLS;
export const BLOG_POSTS = GENERATED_BLOG_POSTS;

export const SOCIAL_LINKS: SocialLink[] = [
	{
		label: "Github",
		link: "https://github.com/mbonum",
	},
	{
		label: "LinkedIn",
		link: "https://www.linkedin.com/",
	},
];

export const EMAIL = "your@email.com";
```

- [ ] **Step 2: Update homepage imports**

Modify the import in `app/page.tsx`:

```ts
import {
	BLOG_POSTS,
	EDUCATION,
	EMAIL,
	PROJECTS,
	SKILLS,
	SOCIAL_LINKS,
	SUMMARY,
	WORK_EXPERIENCE,
} from "./data";
```

- [ ] **Step 3: Render generated summary**

Replace the hardcoded intro paragraph in `app/page.tsx` with:

```tsx
<p className="text-zinc-600 dark:text-zinc-400">{SUMMARY}</p>
```

- [ ] **Step 4: Hide empty projects**

Wrap the selected projects section in `app/page.tsx`:

```tsx
{PROJECTS.length > 0 ? (
	<motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION}>
		<h3 className="mb-5 text-lg font-medium">Selected Projects</h3>
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			{PROJECTS.map((project) => (
				<div key={project.name} className="space-y-2">
					<div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
						<ProjectVideo src={project.video} />
					</div>
					<div className="px-1">
						<a
							className="font-base group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
							href={project.link}
							target="_blank"
						>
							{project.name}
							<span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-50"></span>
						</a>
						<p className="text-base text-zinc-600 dark:text-zinc-400">
							{project.description}
						</p>
					</div>
				</div>
			))}
		</div>
	</motion.section>
) : null}
```

- [ ] **Step 5: Render skills and education**

Add these sections after work experience and before blog:

```tsx
<motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION}>
	<h3 className="mb-5 text-lg font-medium">Skills</h3>
	<ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
		{SKILLS.map((skill) => (
			<li key={skill}>{skill}</li>
		))}
	</ul>
</motion.section>

<motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION}>
	<h3 className="mb-5 text-lg font-medium">Education</h3>
	<div className="flex flex-col space-y-3">
		{EDUCATION.map((item) => (
			<div key={item.id}>
				<h4 className="font-normal dark:text-zinc-100">{item.school}</h4>
				<p className="text-zinc-500 dark:text-zinc-400">{item.detail}</p>
				{item.location ? (
					<p className="text-sm text-zinc-500 dark:text-zinc-500">
						{item.location}
					</p>
				) : null}
			</div>
		))}
	</div>
</motion.section>
```

- [ ] **Step 6: Verify TypeScript/build**

Run: `pnpm build`

Expected: Next.js production build exits 0.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
git add app/data.ts app/page.tsx
git commit -m "feat: render generated personal content"
```

## Task 4: Documentation and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `INSTALLATION.md`

- [ ] **Step 1: Document local sync**

Add this concise section to `README.md`:

```md
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
```
```

- [ ] **Step 2: Update installation guide**

Replace the generic blog instructions in `INSTALLATION.md` with:

```md
## Updating Content

Write public blog notes in `/home/mb/Documents/ObsidianVault/Public`.
Edit the CV at `/home/mb/Documents/cv/cv.md`.

Then run:

```bash
pnpm sync:content
pnpm build
```

The sync command generates `app/generated-content.ts` and blog routes under `app/blog/<slug>/page.mdx`.
```
```

- [ ] **Step 3: Run content tests**

Run: `pnpm test:content`

Expected: PASS.

- [ ] **Step 4: Run sync**

Run: `pnpm sync:content`

Expected: one synced blog post and CV content synced from the configured local paths.

- [ ] **Step 5: Run production build**

Run: `pnpm build`

Expected: Next.js production build exits 0.

- [ ] **Step 6: Review final diff**

Run: `rtk git diff --stat`

Expected: changes are limited to sync scripts, generated content, homepage/data updates, docs, and generated blog pages.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add README.md INSTALLATION.md
git commit -m "docs: document local content sync"
```
