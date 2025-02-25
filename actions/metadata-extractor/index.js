const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");
const github = require("@actions/github");

function loadConfig() {
  try {
    const fileContents = fs.readFileSync("./config.yml", "utf8");
    return yaml.load(fileContents);
  } catch (e) {
    core.error(`Ошибка загрузки config.yml: ${e}`);
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
  return { date, time, combined: `${date}${time}` };
}

function extractSemverParts(versionString) {
  const normalized = versionString.replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+$/.test(normalized)) {
    core.warning(`Not a valid semver string: ${versionString}`);
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

  const config = loadConfig();
  const tagsConfig = config.tags || {};

  const ref = github.context.ref;
  const ref_name = extractRefName(ref);

  const template = core.getInput("template");

  const parts = generateSnapshotVersionParts();
  const semver = extractSemverParts(ref_name);

  const suffix = tagsConfig[ref_name] || "SNAPSHOT";

  const values = { ...semver, ...parts, suffix, ...github.context };

  const result = fillTemplate(template, values);

  core.info(`Ref: ${ref}`);
  core.info(`Ref name: ${ref_name}`);
  core.info(`Date: ${parts.date}`);
  core.info(`Time: ${parts.time}`);
  core.info(`Combined: ${parts.combined}`);
  core.info(`Major: ${semver.major}`);
  core.info(`Minor: ${semver.minor}`);
  core.info(`Patch: ${semver.patch}`);
  core.info(`Suffix: ${suffix}`);
  core.info(`Template: ${template}`);
  core.info(`Template result: ${result}`);

  core.setOutput("template", result);
}

run();
