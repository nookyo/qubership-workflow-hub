const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");
const github = require("@actions/github");

function loadConfig(configPath) {
  try {
    const fileContents = fs.readFileSync(configPath, "utf8");
    return yaml.load(fileContents);
  } catch (e) {
    core.error(`Failed to load config.yml: ${e}`);
    return {};
  }
}

function extractRefName(ref) {
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

function generateSnapshotVersionParts() {
  const now = new Date();
  const iso = now.toISOString(); // "2025-02-25T14:30:53.123Z"
  const date = iso.slice(0, 10).replace(/-/g, ""); // "20250225"
  const time = iso.slice(11, 19).replace(/:/g, ""); // "143053"
  return { date, time, combine: `${date}${time}` };
}

function extractSemverParts(versionString) {
  const normalized = versionString.replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+$/.test(normalized)) {
    core.warning(`Not a valid semver string (skip): ${versionString}`);
    return { major: "", minor: "", patch: "" };
  }
  const [major, minor, patch] = normalized.split(".");
  return { major, minor, patch };
}

function fillTemplate(template, values) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return key in values ? values[key] : match;
  });
}

async function run() {

  const template = core.getInput("template");
  const configPath = core.getInput("config-path") || "./.github/metadata-extractor-config.yml";

  const config = loadConfig(configPath);
  const tagsConfig = config.tags || {};

  const ref = core.getInput('ref') || github.context.ref;
  const ref_name = extractRefName(ref);

  const parts = generateSnapshotVersionParts();
  const semver = extractSemverParts(ref_name);

  const tag = tagsConfig[ref_name] || "SNAPSHOT";

  const values = { ...semver, ...parts, tag, ...github.context };

  const result = fillTemplate(template, values);

  core.info(`Ref: ${ref}`);
  core.info(`Ref name: ${ref_name}`);
  core.info(`Date: ${parts.date}`);
  core.info(`Time: ${parts.time}`);
  core.info(`Timestamp: ${parts.combine}`);
  core.info(`Major: ${semver.major}`);
  core.info(`Minor: ${semver.minor}`);
  core.info(`Patch: ${semver.patch}`);
  core.info(`Tag: ${tag}`);
  core.info(`Rendered template: ${result}`);


  core.setOutput("rendered-template", result);
  core.setOutput("ref", ref);
  core.setOutput("ref-name", ref_name);
  core.setOutput("date", parts.date;
  core.setOutput("time", parts.time);
  core.setOutput("timestamp", parts.combine);

  core.setOutput("major", semver.major);
  core.setOutput("minor", semver.minor);
  core.setOutput("patch", semver.patch);
  core.setOutput("tag", tag);

}

run();
