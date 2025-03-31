const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);

    try {

         const response = await octokit.request('GET /users/{username}/packages', {
            username: 'nookyo',
            package_type: 'container',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })

        console.log("Package:", response.data);


    } catch (error) {
        console.error("error:", error.message);
        console.error("detail:", error.package_version?.data || error);
    }
}

run();