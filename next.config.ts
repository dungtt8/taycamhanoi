import type { NextConfig } from "next";

const wooUrl = process.env.WOOCOMMERCE_URL;
const wooHost = wooUrl ? new URL(wooUrl) : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: wooHost
      ? [
          {
            protocol: wooHost.protocol === "https:" ? "https" : "http",
            hostname: wooHost.hostname,
            port: wooHost.port || undefined,
          },
        ]
      : [],
  },
};

export default nextConfig;
