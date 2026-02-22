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
  async headers() {
    return [
      // Astro 정적 에셋 — 콘텐츠 해시 포함, 영구 캐시
      {
        source: "/_astro/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 랜딩 HTML — 직접 접근 시 검색엔진 제외
      {
        source: "/_landing.html",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
      // 보안 헤더 (Cloudflare _headers 대체)
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
