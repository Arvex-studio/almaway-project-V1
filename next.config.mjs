/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // The dev toolbar can cover mobile navigation during CI browser tests.
  // Next still surfaces compile/runtime errors when the indicator is hidden.
  devIndicators: process.env.CI ? false : undefined,
}

export default nextConfig
