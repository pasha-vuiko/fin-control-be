/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  plugins: [
    '@semantic-release/git',
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
  ],
  branches: ['main'],
};
