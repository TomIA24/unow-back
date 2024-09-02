module.exports = {
  apps: [
    {
      name: "unow-back",
      script: "server.js",
      env: {
        NODE_ENV: "development",
        DATABASE_ACCESS: process.env.DATABASE_ACCESS,
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
        PORT: process.env.BACK_PORT,
        CLIENT: process.env.CLIENT,
        STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
      },
    },
  ],
};
