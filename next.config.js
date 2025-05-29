module.exports = {
  images: {
    domains: [
      'localhost',
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
  env: {
    UPSTAGE_API_KEY: process.env.UPSTAGE_API_KEY,
  },
};
