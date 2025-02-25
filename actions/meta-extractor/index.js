const core = require("@actions/core");
const github = require("@actions/github");


async function run() {
    const ref = github.context.ref;
    const branch = ref.split("/").pop();

    core.debug(`Branch: ${branch}`);
    core.debug(`Ref: ${ref}`);

}


run();