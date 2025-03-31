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
            package_type: 'container'
        });

        console.log("Packages:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
}

run();