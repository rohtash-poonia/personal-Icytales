/** @type {import("next").NextConfig} */
const defaultApiOrigin =
  process.env.NODE_ENV === "production"
    ? "https://personal-icytales.onrender.com"
    : "http://127.0.0.1:5000";
const apiOrigin = (
  process.env.API_PROXY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  defaultApiOrigin
).replace(/\/$/, "");

const nextConfig = {
  distDir: process.env.ICYTALES_E2E === "1" ? ".next-e2e" : ".next",
  reactCompiler: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
