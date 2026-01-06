module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/ethanwisperer/cip-semantic-tutorial.git",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        parserOpts: {
          // Note: In JS files, we use actual Regex / / instead of strings
          headerPattern: /^CIP-(\d+)\s+(feat|fix|perf|docs|chore|style|refactor)(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["ticket", "type", "scope", "subject"]
        },
        releaseRules: [
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
        presetConfig: {
          issuePrefixes: ["CIP-"],
          issueUrlFormat: "https://wisperai-team.atlassian.net/browse/{{prefix}}{{id}}"
        },
        parserOpts: {
          headerPattern: /^CIP-(\d+)\s+(feat|fix|perf|docs|chore|style|refactor)(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["ticket", "type", "scope", "subject"]
        },
        writerOpts: {
          transform: (commit) => {
            const newCommit = { ...commit };
        
            // 1. Prepend Ticket to Subject
            if (newCommit.ticket) {
              newCommit.subject = `CIP-${newCommit.ticket}: ${newCommit.subject}`;
            }
        
            // 2. STUBBORN SCOPE CLEANER
            // We set it to null and delete it to ensure the template ignores the parentheses
            if (!newCommit.scope || newCommit.scope.trim() === "") {
              delete newCommit.scope;
            }
        
            const typeMap = {
              feat: "Features",
              fix: "Bug Fixes",
              perf: "Performance Improvements",
              docs: "Documentation",
              chore: "Maintenance"
            };
        
            newCommit.type = typeMap[newCommit.type] || newCommit.type;
            
            // 3. Remove the redundant "closes" footer from the bottom of the notes
            // if you don't want the "closes CIP-XXX" text at the end.
            newCommit.references = []; 
        
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