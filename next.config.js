/** @type {import('next').NextConfig} */
module.exports = {
  outputFileTracingRoot: __dirname,
  // Migration must pass the compiler; do not inherit legacy type-error bypasses.
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
}
