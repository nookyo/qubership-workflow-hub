const core = require("@actions/core");
const github = require("@actions/github");

async function run() {

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    console.log(`owner ${owner}`)
    console.log(`repo ${repo}`)

}

run();