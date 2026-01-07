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
    ["@semantic-release/exec", {
      "prepareCmd": "echo ${nextRelease.version}"
    }],
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
            // 1. Clone to avoid Immutable Error
            let raw = { ...commit };

            const jiraBaseUrl = "https://wisperai-team.atlassian.net/browse/CIP-";

            // 2. Filter Types
            if (!['feat', 'fix', 'perf'].includes(raw.type)) {
              return null;
            }

            // 3. CLEANUP:
            // Remove scope to prevent empty () from scope
            raw.scope = null;
            
            // ⚠️ ENABLE HASH:
            // Ensure we use the short version (7 chars) for the display text
            if (typeof raw.hash === 'string') {
              raw.shortHash = raw.hash.substring(0, 7);
            }
            if (raw.shortHash) {
              raw.hash = raw.shortHash;
            }

            // 4. Format Subject with Jira Link
            const originalType = raw.type;
            if (raw.ticket) {
              const ticketId = `CIP-${raw.ticket}`;
              const ticketLink = `[${ticketId}](${jiraBaseUrl}${raw.ticket})`;
              
              raw.subject = `${ticketLink} ${originalType}: ${raw.subject}`;
            }

            // 5. Section Headers
            if (raw.type === 'feat') {
              raw.type = 'Features';
            } else if (raw.type === 'fix') {
              raw.type = 'Bug Fixes';
            } else if (raw.type === 'perf') {
              raw.type = 'Performance Improvements';
            }

            // 6. Breaking Changes (Immutable Fix)
            if (raw.isBreaking === '!') {
               raw.notes = raw.notes ? [...raw.notes] : [];
               
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
    "@semantic-release/github"
  ]
};