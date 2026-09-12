import type { NextConfig } from "next";

const wooUrl = process.env.WOOCOMMERCE_URL;
const wooHost = wooUrl ? new URL(wooUrl) : undefined;

const nextConfig: NextConfig = {
  images: {
    // Next.js defaults optimized images to Content-Disposition: attachment,
    // which some strict browser contexts honor even for <img> tags and
    // refuse to render inline. Our remote source is our own trusted
    // WooCommerce media library, so it's safe to force inline display.
    contentDispositionType: "inline",
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
