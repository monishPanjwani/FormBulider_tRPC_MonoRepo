/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.VERCEL_ENV !== "production") return [];

    return [
      {
        source: "/trpc/:path*",
        destination: "https://formbulider.netlify.app/trpc/:path*",
      },
    ];
  },
};

export default nextConfig;
