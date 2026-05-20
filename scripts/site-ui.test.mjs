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

test("homepage only renders the blog section when posts exist", async () => {
	const page = await readFile("app/page.tsx", "utf8");

	assert.match(page, /BLOG_POSTS\.length > 0 \?/);
	assert.match(page, /<h3 className="mb-5 text-lg font-medium">Blog<\/h3>/);
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

test("contact email is masked on the homepage", async () => {
	const page = await readFile("app/page.tsx", "utf8");

	assert.doesNotMatch(page, /\bEMAIL\b/);
	assert.doesNotMatch(page, /mailto:/);
	assert.match(page, /mu8qqy1h9 \[at\] mozmail \[dot\] com/);
});

test("homepage imports morphing dialog components from local UI module", async () => {
	const page = await readFile("app/page.tsx", "utf8");

	assert.match(page, /from ['"]@\/components\/ui\/morphing-dialog['"]/);
	assert.match(page, /import \{ motion \} from ['"]motion\/react['"]/);
	assert.doesNotMatch(page, /MorphingDialogTrigger,\s*\n\} from ['"]motion\/react['"]/);
});

test("social links open in a new tab", async () => {
	const page = await readFile("app/page.tsx", "utf8");
	const socialLinkStart = page.indexOf("function MagneticSocialLink");
	const personalStart = page.indexOf("export default function Personal");
	const socialLinkComponent = page.slice(socialLinkStart, personalStart);

	assert.match(socialLinkComponent, /target="_blank"/);
	assert.match(socialLinkComponent, /rel="noopener noreferrer"/);
});

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

test("deployment exposes Cloudflare Web Analytics token to the build", async () => {
	const workflow = await readFile(".github/workflows/nextjs.yml", "utf8");

	assert.match(workflow, /NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
	assert.match(
		workflow,
		/\$\{\{\s*vars\.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN\s*\}\}/,
	);
});
