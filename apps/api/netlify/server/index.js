// The API build bundles the TypeScript workspace packages and listens on Netlify's PORT.
process.env.NODE_ENV ??= "production";
require("../../dist/index.js");
