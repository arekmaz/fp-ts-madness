module.exports = {
  "*.{ts,tsx,json,md,yaml,yml,css,sass,scss,js,jsx,toml,html,xml}": [
    "prettier --write",
  ],
  "*.{ts,tsx,js,jsx}": ["eslint --max-warnings=0", "jest --findRelatedTests"],
};
