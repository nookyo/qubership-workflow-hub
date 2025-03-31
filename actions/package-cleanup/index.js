const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require('@octokit/graphql');



async function run() {

    const repository = github.context.repo;
    console.log(`Assembly ru on: ${repository.owner}/${repository.repo}`);
    console.log(`event: ${github.context.eventName}`);

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

    graphql(query, {
        owner,
        name: repo,
        headers: {
            authorization: `token ${token}`
        }
    })
        .then(result => {
            const packages = result.repository.packages.nodes;
            // Например, фильтруем только npm-пакеты
            //const npmPackages = packages.filter(pkg => pkg.packageType.toLowerCase() === 'docker');
            console.log("NPM пакеты:", packages);
        })
        .catch(error => {
            console.error("Ошибка при получении пакетов:", error);
        });


}


run();