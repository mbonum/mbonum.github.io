# Personal Site Content Sync Design

## Goal

Personalize the Nim-based Next.js site at `mgb.is-a.dev` with Mirko Bonomi's CV and blog posts written in Obsidian, while keeping the published GitHub Pages repository fully static and deployable.

## Sources

- CV source: `/home/mb/Documents/cv/cv.md`
- Blog source: `/home/mb/Documents/ObsidianVault/Public`
- Publish rule: every Markdown or MDX note in the Public folder is publishable.

## Approach

Use a local sync script as the bridge from private local writing sources into committed site files.

The script reads the CV and Obsidian notes, generates repo-native content, and leaves the Next.js app with normal static files. This avoids depending on local absolute paths during GitHub Pages builds, where `/home/mb/Documents/...` will not exist.

## Generated Outputs

- Homepage/CV data is generated into a repo-owned data file consumed by `app/page.tsx`.
- Blog notes are generated as filesystem routes under `app/blog/<slug>/page.mdx`.
- The blog listing data is generated from the same note metadata so the homepage index stays in sync.

## Blog Metadata

The sync uses hybrid metadata:

- Frontmatter wins when present.
- `title` defaults to frontmatter `title`, then first `#` heading, then filename.
- `slug` defaults to a URL-safe version of the filename.
- `description` defaults to frontmatter `description`, then the first useful paragraph, then an empty string.
- `date` defaults to frontmatter `date`, then file modified time.

## CV Mapping

The CV sync preserves the current minimal homepage shape:

- Summary becomes the intro section.
- Work experience becomes the work section.
- Skills become a compact skills section.
- Education is included as a compact section after skills.
- Social/contact values stay explicit site configuration, not inferred from the CV unless added later.

## Command

Add a script:

```bash
pnpm sync:content
```

Expected workflow:

```bash
pnpm sync:content
pnpm build
git add .
git commit
git push
```

## Constraints

- Keep Obsidian as the writing source of truth.
- Keep generated site files committed so deploys remain static and reproducible.
- Do not require GitHub Actions or the hosting environment to access the local Obsidian vault or CV file.
- Keep the template minimal; avoid CMS features, databases, and runtime content loading.

## Testing

- Script verification covers metadata parsing and slug generation.
- Build verification with `pnpm build`.
- Manual check that the homepage lists the synced CV sections and the generated blog links resolve.
