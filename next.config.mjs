import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	output: "export",
	// User/org site (mbonum.github.io + custom domain): served from root, not /repo-name
	basePath: "",
	images: {
		unoptimized: true,
	},
	turbopack: {},
};

const withMDX = createMDX({
	extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
