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
          // We use 'isBreaking' to track the "!" separately
          headerCorrespondence: ["ticket", "type", "isBreaking", "scope", "subject"]
        },
        releaseRules: [
          { isBreaking: "!", release: "major" },
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
          headerCorrespondence: ["ticket", "type", "isBreaking", "scope", "subject"]
        },
        writerOpts: {
          transform: (commit, context) => {
            const raw = { ...commit };

            // --- CONFIGURATION ---
            // 1. Set your Jira URL here (don't forget the trailing slash if needed)
            const jiraBaseUrl = "https://your-domain.atlassian.net/browse/CIP-"; 
            // ---------------------

            if (!['feat', 'fix', 'perf'].includes(raw.type)) {
              return null;
            }

            // 2. Fix the "()" issue by ensuring empty scope is NULL, not empty string
            if (!raw.scope || raw.scope === "") {
              raw.scope = null;
            }

            const originalType = raw.type;

            // 3. Create the Clickable Jira Link
            if (raw.ticket) {
              const ticketId = `CIP-${raw.ticket}`;
              const ticketLink = `[${ticketId}](${jiraBaseUrl}${raw.ticket})`;
              
              // Result: "[CIP-119](url) feat: message"
              raw.subject = `${ticketLink} ${originalType}: ${raw.subject}`;
            }

            // 4. Map Types
            if (raw.type === 'feat') {
              raw.type = 'Features';
            } else if (raw.type === 'fix') {
              raw.type = 'Bug Fixes';
            } else if (raw.type === 'perf') {
              raw.type = 'Performance Improvements';
            } else {
              return null;
            }

            // 5. Breaking Changes Header
            if (raw.isBreaking === '!') {
               raw.notes = raw.notes || [];
               const hasBreakingNote = raw.notes.some(n => n.title === 'BREAKING CHANGES');
               if (!hasBreakingNote) {
                 raw.notes.push({
                   title: 'BREAKING CHANGES',
                   text: 'This release contains breaking changes declared in the commit header.'
                 });
               }
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