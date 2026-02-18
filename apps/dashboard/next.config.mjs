/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
      },
      // TODO(production): 목데이터 제거 시 함께 삭제 (Discord CDN/자체 스토리지만 허용)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "jasjvfkbprkzxhsnxstd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
export default nextConfig;
