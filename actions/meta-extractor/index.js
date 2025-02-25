const core = require("@actions/core");
const github = require("@actions/github");

async function exctractRefName(ref) {
  let name = "";

  if (ref.startsWith("refs/heads/")) {
    name = ref.replace("refs/heads/", "").replace(/\//g, "-");
    core.info(`Run-on branch: ${name}`);
  } else if (ref.startsWith("refs/tags/")) {
    name = ref.replace("refs/tags/", "").replace(/\//g, "-");
    core.info(`Run-on tag: ${name}`);
  } else {
    core.warning(`Не удалось определить тип ref: ${ref}`);
  }

  return name;
}

async function run() {
  const ref = github.context.ref;

  const name = await exctractRefName(ref);

  core.warning(`ref name: ${name}`);
  core.warning(`Ref: ${ref}`);
}

run();
