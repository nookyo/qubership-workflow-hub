const core = require("@actions/core");
const github = require("@actions/github");

async function run() {

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);

    let respond =  await octokit.request('GET /user/packages', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

    console.log(`Respond data: ${respond.data}`);

}

run();