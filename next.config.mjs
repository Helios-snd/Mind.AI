/** @type {import('next').NextConfig} */

// The backend is proxied same-origin so the session cookie is first-party.
// Without this, an httpOnly cookie set by FastAPI on :8000 and read by Next on
// :3000 would be cross-site, requiring SameSite=None + Secure + HTTPS in dev.
const API_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${API_ORIGIN}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
