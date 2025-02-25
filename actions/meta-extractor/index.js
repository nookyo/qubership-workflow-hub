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

async function generateTimestampt() {
  const now = new Date();
  const iso = now.toISOString(); // например, "2025-02-25T14:30:53.123Z"
  const date = iso.slice(0, 10).replace(/-/g, ""); // "20250225"
  const time = iso.slice(11, 19).replace(/:/g, ""); // "143053"
  return `${date}${time}`;
}

async function run() {
  const ref = github.context.ref;

  const name = await exctractRefName(ref);
  const timestampt = await generateTimestampt();

  core.warning(`Ref: ${ref}`);
  core.warning(`ref name: ${name}`);
  core.warning(`temestampt: ${timestampt}`);
}

run();
