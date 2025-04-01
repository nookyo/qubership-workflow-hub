const core = require("@actions/core");
const github = require("@actions/github");

async function run() {

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    const token = process.env.GITHUB_TOKEN;
    const package_token = process.env.PACKAGE_TOKEN;
    const octokit = github.getOctokit(package_token);
    // const octokit = github.getOctokit(token);

    let respond = await octokit.request('GET /user/packages', {
        package_type: 'maven',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    console.log(`Respond data: ${respond.data}`);

    const package = await octokit.request('GET /users/{username}/packages', {
        username: 'nookyo',
        package_type: 'container',
    });
    console.log("Package:", package.data);
}

run();