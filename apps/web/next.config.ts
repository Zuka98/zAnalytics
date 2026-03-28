import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["bcrypt-ts"],
	transpilePackages: ["@zanalytics/db"],
};

export default nextConfig;
