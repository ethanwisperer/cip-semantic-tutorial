module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/ethanwisperer/cip-semantic-tutorial.git",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        parserOpts: {
          // Added (!) and "breaking" correspondence
          headerPattern: /^CIP-(\d+)\s+(feat|fix|perf|docs|chore|style|refactor)(!)?(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["ticket", "type", "breaking", "scope", "subject"]
        },
        releaseRules: [
          { type: "feat",breaking:true, release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" }
        ]
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        parserOpts: {
          headerPattern: /^CIP-(\d+)\s+(feat|fix|perf|docs|chore|style|refactor)(!)?(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["ticket", "type", "breaking", "scope", "subject"]
        }
      }
    ],
    "@semantic-release/changelog",
    ["@semantic-release/npm", { npmPublish: false }],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
};