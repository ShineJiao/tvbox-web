/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // 仅 Docker 部署时启用，Vercel 部署需注释
  images: {
    domains: ['*'],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
