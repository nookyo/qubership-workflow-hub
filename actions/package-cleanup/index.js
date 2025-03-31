const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require('@octokit/graphql');

async function run() {
    const repository = github.context.repo;
    console.log(`Assembly run on: ${repository.owner}/${repository.repo}`);
    console.log(`Event: ${github.context.eventName}`);

    const token = process.env.GITHUB_TOKEN;
    const [owner] = process.env.GITHUB_REPOSITORY.split('/');

    const query = `
        query($owner: String!) {
            user(login: $owner) {
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
            headers: {
                authorization: `token ${token}`
            }
        });

        console.log("Packages:", result.user.packages.nodes);
    } catch (error) {
        console.error("Error:", error.message);
        console.error("Details:", error.response?.data || error);
    }
}

run();