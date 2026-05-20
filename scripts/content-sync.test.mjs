import test from "node:test";
import assert from "node:assert/strict";
import {
	extractBlogMetadata,
	parseCv,
	parseFrontmatter,
	renderGeneratedContent,
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

**QA Automation Engineer**, DonTouch SA, Chiasso 03/2026-present

- Develop and maintain integration tests
- Identify bugs

**Software Engineer**, Alma Iura, Verona 11/2025-03/2026

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
	assert.equal(parsed.workExperience[0].start, "2026-03");
	assert.equal(parsed.workExperience[0].end, "Present");
	assert.equal(parsed.workExperience[1].start, "2025-11");
	assert.equal(parsed.workExperience[1].end, "2026-03");
	assert.equal(parsed.education.length, 1);
	assert.equal(parsed.skills.length, 2);
});

test("renderGeneratedContent preserves blog post element type when there are no posts", () => {
	const rendered = renderGeneratedContent({
		cv: {
			summary: "Fast-learning software engineer.",
			workExperience: [],
			education: [],
			skills: [],
		},
		posts: [],
	});

	assert.match(rendered, /type GeneratedBlogPost =/);
	assert.match(
		rendered,
		/export const GENERATED_BLOG_POSTS: readonly GeneratedBlogPost\[] = \[\] as const;/,
	);
});
