// With a motherfucking microphone, plug it in my soul
// I'm a renegade riot getting out of control
// I'm-a keeping it alive and continue to be
// Flying like an eagle to my destiny

const core = require("@actions/core");
const github = require("@actions/github");

const ConfigLoader = require("./loader");
const RefExtractor = require("./extractor");

function generateSnapshotVersionParts() {
  const now = new Date();
  const iso = now.toISOString(); // "2025-02-25T14:30:53.123Z"
  const date = iso.slice(0, 10).replace(/-/g, ""); // "20250225"
  const time = iso.slice(11, 19).replace(/:/g, ""); // "143053"
  return { date, time, timestamp: `${date}${time}` };
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


function matchesPattern(refName, pattern) {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return regex.test(refName);
}

function findTemplate(refName, templates) {
  for (let pattern in templates) {
    if (matchesPattern(refName, pattern)) {
      return templates[pattern];
    }
  }
  return null;
}

function findDistTag(ref, distTags) {
  let branchName = ref.name;
  if (ref.isTag) {
    return distTags["tag"] || "latest";
  }
  for (let key in distTags) {
    if (key.includes('*')) {
      if (matchesPattern(branchName, key)) {
        return distTags[key];
      }
    } else {
      if (branchName === key || branchName.startsWith(key + "/")) {
        return distTags[key];
      }
    }
  }
  return null;
}

function fillTemplate(template, values) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return key in values ? values[key] : match;
  });
}

async function run() {
  // const def_template = core.getInput("default-template");

  const name = core.getInput('ref') || github.context.ref;
  const ref = new RefExtractor().extract(name);


  const configurationPath = core.getInput('configuration-path') || "./.github/metadata-action-config.yml";
  const loader = new ConfigLoader().load(configurationPath);


  core.info(`Ref: ${JSON.stringify(ref)}`);
  core.info(`ref, name: ${ref.name}`);
  core.info(`ref, isTag: ${ref.isTag}`);

  core.info(`Branches: ${JSON.stringify(loader["branches-template"])}`);

  const template = findTemplate(!ref.isTag ? ref.name : "tag", loader["branches-template"]);

  core.info(`Template: ${template}`);

  // let fill =  fillTemplate(template, { ...ref, ...generateSnapshotVersionParts(), ...extractSemverParts(ref.name) });

  const parts = generateSnapshotVersionParts();
  const semverParts = extractSemverParts(ref.name);
  const distTag = findDistTag(ref, loader["dist-tags"]) || "default";
  const values = { ...ref, ...semverParts, ...parts, ...github.context, distTag };

  core.info(`parts: ${JSON.stringify(parts)}`);
  core.info(`semverParts: ${JSON.stringify(semverParts)}`);
  core.info(`dist-tag: ${JSON.stringify(distTag)}`);

  let result = fillTemplate(template, values)

  core.info(`Rendered template: ${result}`);

  core.setOutput("result", result);
  core.setOutput("ref", ref);
  core.setOutput("ref-name", ref.name);
  core.setOutput("date", parts.date);
  core.setOutput("time", parts.time);
  core.setOutput("Timestamp", parts.timestamp);
  core.setOutput("major", semverParts.major);
  core.setOutput("minor", semverParts.minor);
  core.setOutput("patch", semverParts.patch);
  core.setOutput("tag", distTag);
}

run();