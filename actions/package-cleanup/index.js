const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const repository = github.context.repo;
    console.log(`Assembly run on: ${repository.owner}/${repository.repo}`);
    console.log(`Event: ${github.context.eventName}`);

    const token = process.env.GITHUB_TOKEN;
    const [owner] = process.env.GITHUB_REPOSITORY.split('/');
    const octokit = github.getOctokit(token);

    try {

        const response = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}', {
            package_type: 'container',
            package_name: 'qubership-dbaas',
            username: 'nookyo',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

        console.log("Packages:", response.data);
    } catch (error) {
        console.error("Error:", error.message);
        console.error("Details:", error.response?.data || error);
    }
}

run();