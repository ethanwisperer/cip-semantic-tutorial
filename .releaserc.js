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
          // ⚠️ FIXED: Breaking features should be major, not minor
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
          transform: (commit, context) => {
            // 1. CLONE THE OBJECT to avoid "Immutable" error
            // We use spread syntax (...) to create a writable copy
            const raw = { ...commit };
            
            // 2. Filter out unwanted types
            if (!['feat', 'fix', 'perf'].includes(raw.type)) {
              return null;
            }

            // 3. Logic to rewrite the subject
            const originalType = raw.type;

            if (raw.ticket) {
              const ticketPrefix = `CIP-${raw.ticket} ${originalType}:`;
              raw.subject = `${ticketPrefix} ${raw.subject}`;
            }

            // 4. Map types to Section Headers
            if (raw.type === 'feat') {
              raw.type = 'Features';
            } else if (raw.type === 'fix') {
              raw.type = 'Bug Fixes';
            } else if (raw.type === 'perf') {
              raw.type = 'Performance Improvements';
            } else {
              return null;
            }

            // 5. Handle Breaking Change Notes
            // We also need to clone the notes array if we want to modify it
            if (raw.notes && raw.notes.length > 0) {
               raw.notes = raw.notes.map(note => {
                 return { ...note, title: 'BREAKING CHANGES' };
               });
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