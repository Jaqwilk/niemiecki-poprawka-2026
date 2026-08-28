import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const isHostingerExport = process.env.HOSTINGER_STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  devIndicators: false,
  ...(isHostingerExport
    ? {
        output: 'export',
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  turbopack: {
    root: process.cwd(),
  },
};

export default withMDX(config);
