import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("homepage omits skills and education, and renders work experience without links", async () => {
	const page = await readFile("app/page.tsx", "utf8");

	assert.doesNotMatch(page, /SKILLS/);
	assert.doesNotMatch(page, />Skills</);
	assert.doesNotMatch(page, /EDUCATION/);
	assert.doesNotMatch(page, />Education</);
	assert.doesNotMatch(page, /href=\{job\.link\}/);
	assert.doesNotMatch(page, /\bexternal\b/);
});

test("blog layout has no copy-url action", async () => {
	const layout = await readFile("app/blog/layout.tsx", "utf8");

	assert.doesNotMatch(layout, /CopyButton/);
	assert.doesNotMatch(layout, /navigator\.clipboard/);
	assert.doesNotMatch(layout, />URL</);
});

test("root layout keeps footer at the viewport bottom on short pages", async () => {
	const layout = await readFile("app/layout.tsx", "utf8");

	assert.match(layout, /<main className="relative mx-auto w-full max-w-screen-sm flex-1/);
	assert.match(layout, /<Footer \/>/);
	assert.doesNotMatch(layout, /\{children\}\s*<Footer \/>/);
});

test("generated work experience dates use YYYY-MM format", async () => {
	const generated = await readFile("app/generated-content.ts", "utf8");

	assert.match(generated, /"start": "2026-03"/);
	assert.match(generated, /"end": "2026-03"/);
	assert.doesNotMatch(generated, /"start": "\d{2}\/\d{4}"/);
	assert.doesNotMatch(generated, /"end": "\d{2}\/\d{4}"/);
});
