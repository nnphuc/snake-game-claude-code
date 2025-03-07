/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: process.env.NODE_ENV === 'production' ? '/snake-game-claude-code' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/snake-game-claude-code/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}
 
module.exports = nextConfig