const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require('@octokit/graphql');

async function run() {
    const repository = github.context.repo;
    console.log(`Assembly run on: ${repository.owner}/${repository.repo}`);
    console.log(`Event: ${github.context.eventName}`);

    const token = process.env.GITHUB_TOKEN;
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const octokit = github.getOctokit(token);

    const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
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

    try {
        const result = await graphql(query, {
            owner,
            name: repo,
            headers: {
                authorization: `token ${token}`
            }
        });

        const packages = result.repository.packages.nodes;

        // Фильтруем пакеты, связанные с текущим репозиторием
        const associatedPackages = packages.filter(pkg => pkg.name.includes(repo));

        console.log("Associated Packages:", associatedPackages);
    } catch (error) {
        console.error("Error:", error);
    }
}

run();