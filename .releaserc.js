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
          { breaking: true, release: 'major' },
          { type: "feat", release: "minor" },
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
        },
        writerOpts: {
          transform: (commit) => {
            const newCommit = { ...commit };
            if (newCommit.ticket) {
              newCommit.subject = `CIP-${newCommit.ticket}: ${newCommit.subject}`;
            }
            newCommit.scope = undefined;
            newCommit.references = [];

            const typeMap = {
              feat: "Features",
              fix: "Bug Fixes",
              perf: "Performance Improvements",
              docs: "Documentation",
              chore: "Maintenance"
            };

            // If it's a breaking change, label it clearly
            if (newCommit.breaking) {
                newCommit.type = "BREAKING CHANGES 🚨";
            } else {
                newCommit.type = typeMap[newCommit.type] || newCommit.type;
            }

            return newCommit;
          }
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