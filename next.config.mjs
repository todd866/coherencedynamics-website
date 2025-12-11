import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing from visualizations folder outside the project
  transpilePackages: [],
  webpack: (config) => {
    // Add the interactives directory to the module resolution
    config.resolve.alias['@interactives'] = path.resolve(__dirname, '../interactives');
    return config;
  },
  // Extend the default include paths for TypeScript
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
