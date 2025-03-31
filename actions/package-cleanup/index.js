const core = require('@actions/core');
const github = require('@actions/github');



async function run() {

    const repository = github.context.repo;
    console.log(`Assembly ru on: ${repository.owner}/${repository.repo}`);
    console.log(`event: ${github.context.eventName}`);
}


run();