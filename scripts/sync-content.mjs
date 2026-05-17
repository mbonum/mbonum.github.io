import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
	extractBlogMetadata,
	GENERATED_NOTICE,
	parseCv,
	renderBlogPage,
	renderGeneratedContent,
} from './content-sync-lib.mjs';

const repoRoot = process.cwd();
const cvPath = process.env.CV_PATH ?? '/home/mb/Documents/cv/cv.md';
const blogSourceDir =
	process.env.OBSIDIAN_PUBLIC_DIR ?? '/home/mb/Documents/ObsidianVault/Public';
const blogOutputDir = path.join(repoRoot, 'app/blog');
const generatedContentPath = path.join(repoRoot, 'app/generated-content.ts');

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
			readFile(sourcePath, 'utf8'),
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

		const pagePath = path.join(blogOutputDir, entry.name, 'page.mdx');
		let content = '';
		try {
			content = await readFile(pagePath, 'utf8');
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
			path.join(outputDir, 'page.mdx'),
			'{/* ' + GENERATED_NOTICE + ' */}\n\n' + renderBlogPage(post),
		);
	}
}

async function main() {
	const [cvMarkdown, posts] = await Promise.all([readFile(cvPath, 'utf8'), readBlogPosts()]);
	const cv = parseCv(cvMarkdown);

	await writeFile(generatedContentPath, renderGeneratedContent({ cv, posts }));
	await writeBlogPosts(posts);

	console.log('Synced ' + posts.length + ' blog post(s) from ' + blogSourceDir);
	console.log('Synced CV content from ' + cvPath);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});