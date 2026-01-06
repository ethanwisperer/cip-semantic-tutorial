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
          // ⚠️ FIX: Match the string "!" (captured from regex) instead of boolean true
          { type: "feat", breaking: "!", release: "major" },
          
          // Fallbacks for non-breaking commits
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
          transform: (commit, context) => {
            // 1. Clone to fix "immutable object" error
            const raw = { ...commit };
            
            // 2. Filter types
            if (!['feat', 'fix', 'perf'].includes(raw.type)) {
              return null;
            }

            // 3. Format Subject: "CIP-112 feat: message"
            const originalType = raw.type;
            if (raw.ticket) {
              const ticketPrefix = `CIP-${raw.ticket} ${originalType}:`;
              raw.subject = `${ticketPrefix} ${raw.subject}`;
            }

            // 4. Map Types to Headers
            if (raw.type === 'feat') {
              raw.type = 'Features';
            } else if (raw.type === 'fix') {
              raw.type = 'Bug Fixes';
            } else if (raw.type === 'perf') {
              raw.type = 'Performance Improvements';
            } else {
              return null;
            }

            // 5. Preserve breaking notes
            if (raw.notes && raw.notes.length > 0) {
               raw.notes = raw.notes.map(note => ({ ...note, title: 'BREAKING CHANGES' }));
            }

            return raw;
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