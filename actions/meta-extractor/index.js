const core = require("@actions/core");
const github = require("@actions/github");

async function extractRefName(ref) {
  let name = "";

  if (ref.startsWith("refs/heads/")) {
    name = ref.replace("refs/heads/", "").replace(/\//g, "-");
    core.info(`Run-on branch: ${name}`);
  } else if (ref.startsWith("refs/tags/")) {
    name = ref.replace("refs/tags/", "").replace(/\//g, "-");
    core.info(`Run-on tag: ${name}`);
  } else {
    core.warning(`Cant detect type ref: ${ref}`);
  }

  return name;
}

async function generateSnapshotVersionParts() {
  const now = new Date();
  const iso = now.toISOString(); // "2025-02-25T14:30:53.123Z"
  const date = iso.slice(0, 10).replace(/-/g, '');  // "20250225"
  const time = iso.slice(11, 19).replace(/:/g, '');   // "143053"
  return { date, time, combined: `${date}${time}` };
}

async function extractSemverParts(versionString) {
  const normalized = versionString.replace(/^v/i, '');

  const [major, minor, patch] = normalized.split('.');
  return { major, minor, patch };
}

async function fillTemplate(template, values) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return key in values ? values[key] : match;
  });
}

async function run() {

  const ref = github.context.ref;
  const ref_name = await extractRefName(ref);

  const template = core.getInput("template");

  const parts = await generateSnapshotVersionParts();
  const semver = await extractSemverParts(ref_name);

  const suffixes = {
    "main": "MAIN",
    "release": "RELEASE",
    "develop": "dev",
  };

  const suffix = suffixes[ref_name] || "SNAPSHOT";

  const values = { ...semver, ...parts, suffix, github.context };

  const result = await fillTemplate(template, values);





  // github.context.sha;




  core.warning(`Ref: ${ref}`);
  core.warning(`ref name: ${ref_name}`);

  core.warning(`date: ${parts.date}`);
  core.warning(`time: ${parts.time}`);
  core.warning(`combined: ${parts.combined}`);

  core.warning(`major: ${semver.major}`);
  core.warning(`minor: ${semver.minor}`);
  core.warning(`patch: ${semver.patch}`);


  core.warning(`suffix: ${suffix}`);

  // core.warning(`values: ${values}`);

  core.warning(`template: ${template}`);
  core.warning(`template result: ${result}`);

  core.setOutput("template", template);
}

run();