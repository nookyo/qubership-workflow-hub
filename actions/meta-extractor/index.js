const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const ref = github.context.ref;
  const branch = ref.split("/").pop();

  core.warning(`Branch: ${branch}`);
  core.warning(`Ref: ${ref}`);
}

run();
