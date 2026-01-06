module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/ethanwisperer/cip-semantic-tutorial.git",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        parserOpts: {
          headerPattern: /^CIP-(\d+)\s+(feat|fix|perf|docs|chore|style|refactor)(!)?(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["ticket", "type", "breaking", "scope", "subject"]
        },
        releaseRules: [
          { type: "feat", breaking: true, release: "major" },
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
          // This function formats the commit before it is written to the notes
          transform: (commit, context) => {
            // 1. Filter out types you don't want in the changelog
            // (e.g., usually we hide chores or styles)
            if (!['feat', 'fix', 'perf'].includes(commit.type)) {
              return null;
            }

            const issues = [];
            
            // 2. Formatting the logic: "CIP-X type: subject"
            // We capture the original type before we rename it for the Section Header
            const originalType = commit.type;

            if (commit.ticket) {
              // Create the string "CIP-112 feat: "
              const ticketPrefix = `CIP-${commit.ticket} ${originalType}:`;
              
              // Prepend it to the subject so the line reads: "CIP-112 feat: actual message"
              commit.subject = `${ticketPrefix} ${commit.subject}`;
            }

            // 3. Map types to readable Section Headers
            // This groups them under "Features", "Bug Fixes" etc.
            if (commit.type === 'feat') {
              commit.type = 'Features';
            } else if (commit.type === 'fix') {
              commit.type = 'Bug Fixes';
            } else if (commit.type === 'perf') {
              commit.type = 'Performance Improvements';
            } else {
              // If it's not one of the above, exclude it (safety net)
              return null;
            }

            return commit;
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