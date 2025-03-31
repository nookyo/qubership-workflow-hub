const { graphql } = require("@octokit/graphql");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  
  try {
    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          packages(first: 100) {
            nodes {
              name
              packageType
              latestVersion {
                version
              }
            }
          }
        }
      }
    `;
  
    const result = await graphql(query, {
      owner,
      repo,
      headers: {
        authorization: `token ${token}`,
        // Если потребуется — можно добавить заголовок предварительного просмотра:
        accept: "application/vnd.github.package-deletes-preview+json"
      }
    });
  
    console.log("Repository packages:", result.repository.packages.nodes);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
