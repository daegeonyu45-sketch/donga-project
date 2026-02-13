/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 
    Next.js 이미지 최적화 설정: 
    외부 도메인인 Unsplash 이미지를 허용하도록 remotePatterns를 구성합니다. 
  */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;