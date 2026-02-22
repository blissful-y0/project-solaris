/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  // TODO: supabase gen types 재생성 후 제거
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // 항상 허용 — Discord CDN
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
      },
      // 항상 허용 — Supabase Storage (프로덕션)
      {
        protocol: "https",
        hostname: "jasjvfkbprkzxhsnxstd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // dev 전용 — Unsplash 목데이터 + 로컬 Supabase Storage
      ...(isDev
        ? [
            {
              protocol: "https",
              hostname: "images.unsplash.com",
            },
            {
              protocol: "http",
              hostname: "127.0.0.1",
              port: "54321",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};
export default nextConfig;
