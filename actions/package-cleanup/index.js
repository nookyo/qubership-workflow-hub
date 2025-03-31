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

    try {
        const response = await octokit.request('GET /users/{username}/packages', {
            username: owner,
            package_type: 'container',
            per_page: 100
        });

        console.log("Packages:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
    //     const query = `
    //     query($owner: String!, $name: String!) {
    //       repository(owner: $owner, name: $name) {
    //         packages(first: 100) {
    //           nodes {
    //             name
    //             packageType
    //             latestVersion {
    //               version
    //             }
    //           }
    //         }
    //       }
    //     }
    //   `;
    // const query = `
    //     query($owner: String!) {
    //     user(login: $owner) {
    //         packages(first: 100) {
    //         nodes {
    //             name
    //             packageType
    //             latestVersion {
    //             version
    //             }
    //         }
    //         }
    //     }
    //     }
    //     `;

    // try {
    //     const result = await graphql(query, {
    //         owner,
    //         name: repo,
    //         headers: {
    //             authorization: `token ${token}`
    //         }
    //     });

    //     console.log("GraphQL Result:", JSON.stringify(result, null, 2));

    //     const packages = result.repository.packages.nodes;

    //     // Вывод всех пакетов для отладки
    //     console.log("All Packages:", packages);

    //     // Фильтруем пакеты, связанные с текущим репозиторием
    //     const associatedPackages = packages.filter(pkg =>
    //         pkg.name.toLowerCase().includes(repo.toLowerCase())
    //     );

    //     console.log("Associated Packages:", associatedPackages);
    // } catch (error) {
    //     console.error("Error:", error);
    // }
}

run();