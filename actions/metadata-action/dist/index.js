/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 74:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(958);

class RefExtractor {
    constructor() {

    }
    extract(ref) {
        let name = "";
        let isTag = false;
        if (ref.startsWith("refs/heads/")) {
            name = ref.replace("refs/heads/", "").replace(/\//g, "-");
            core.info(`Run-on branch: ${name}`);
        } else if (ref.startsWith("refs/tags/")) {
            isTag = true;
            name = ref.replace("refs/tags/", "").replace(/\//g, "-");
            core.info(`Run-on tag: ${name}`);
        } else {
            isTag = false;
            name = ref.replace(/\//g, "-");
            core.warning(`🔸 Cant detect type ref: ${ref}`);
        }
        return { name, isTag };
    }
}

module.exports = RefExtractor;

/***/ }),

/***/ 27:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(896);
const yaml = __nccwpck_require__(444);
const core = __nccwpck_require__(958);
const Ajv = __nccwpck_require__(326);
const path = __nccwpck_require__(928);

class ConfigLoader {
  constructor() {
    this.fileExist = true;
  }

  get fileExists() {
    return this.fileExist;
  }

  load(filePath, debug = false) {
    const configPath = path.resolve(filePath);
    console.log(`💡 Try to reading configuration ${configPath}`)

    if (!fs.existsSync(configPath)) {
      core.info(`❗️ Configuration file not found: ${configPath}`);
      this.fileExist = false;
      return;
    }

    const fileContent = fs.readFileSync(configPath, 'utf8');

    let config;
    try {
      config = yaml.load(fileContent);
      if (debug) {
        console.log("🔍 Loaded configuration YAML:", JSON.stringify(config, null, 2));
        console.log("🔑 Object Keys:", Object.keys(config));
      }
    }
    catch (error) {
      core.setFailed(`❗️ Error parsing YAML file: ${error.message}`);
      return;
    }

    const schemaPath = __nccwpck_require__.ab + "config.schema.json";
    if (!fs.existsSync(__nccwpck_require__.ab + "config.schema.json")) {
      core.setFailed(`❗️ Schema file not found: ${schemaPath}`);
      return;
    }

    const schemaContent = fs.readFileSync(__nccwpck_require__.ab + "config.schema.json", 'utf8');

    let schema;
    try {
      schema = JSON.parse(schemaContent);
    }
    catch (error) {
      core.setFailed(`❗️ Error parsing JSON schema: ${error.message}`);
      return;
    }

    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(config);
    if (!valid) {
      let errors = ajv.errorsText(validate.errors);
      core.setFailed(`❗️ Configuration file is invalid: ${errors}`);
      return;
    }
    core.info(`💡 Configuration file is valid: ${valid}`);
    return config;
  }
}

module.exports = ConfigLoader;

/***/ }),

/***/ 90:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(958);

class Report {
    async writeSummary(reportItem, dryRun = false) {
        core.info("Calculate summary statistics.");
        const dryRunText = dryRun ? " (Dry Run)" : "";

        core.summary.addRaw(`### 🧪 Metadata in use: ${dryRunText} \n\n`);

        const fields = [
            ["Ref", reportItem.ref],
            ["SHA", reportItem.sha],
            ["Short SHA", reportItem.shortSha],
            ["Semver", reportItem.semver],
            ["Timestamp", reportItem.timestamp],
            ["Distribution tag", reportItem.distTag],
            ["Extra tags", reportItem.extraTags],
            ["Template", reportItem.template],
            ["Render result", reportItem.renderResult],
        ];

        const rows = fields
            .filter(([_, value]) => value != null && value !== "" && value !== "..")
            .map(([label, value]) => [
                { data: label },
                { data: String(value) }
            ]);

        if (rows.length) {
            core.summary.addTable(rows);
        } else {
            core.summary.addRaw("No data to display.\n");
        }

        core.summary.addRaw(`\n\n---\n\n✅ Metadata extract completed successfully.`);
        await core.summary.write();
    }
}

module.exports = Report;

/***/ }),

/***/ 958:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 394:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 326:
/***/ ((module) => {

module.exports = eval("require")("ajv");


/***/ }),

/***/ 161:
/***/ ((module) => {

module.exports = eval("require")("ajv/dist/vocabularies/discriminator");


/***/ }),

/***/ 444:
/***/ ((module) => {

module.exports = eval("require")("js-yaml");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// With a motherfucking microphone, plug it in my soul
// I'm a renegade riot getting out of control
// I'm-a keeping it alive and continue to be
// Flying like an eagle to my destiny

const core = __nccwpck_require__(958);
const github = __nccwpck_require__(394);

const ConfigLoader = __nccwpck_require__(27);
const RefExtractor = __nccwpck_require__(74);
const { default: def } = __nccwpck_require__(161);

const Report = __nccwpck_require__(90);

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
    core.info(`💡 Not a valid semver string (skip): ${versionString}`);
    return { major: "", minor: "", patch: "" };
  }
  const [major, minor, patch] = normalized.split(".");
  return { major, minor, patch };
}

function matchesPattern(refName, pattern) {
  const normalizedPattern = pattern.replace(/\//g, '-').replace(/\*/g, '.*');
  const regex = new RegExp('^' + normalizedPattern + '$');
  return regex.test(refName);
}

function findTemplate(refName, templates) {
  if (!Array.isArray(templates) || templates.length === 0) return null;

  for (let item of templates) {
    let pattern = Object.keys(item)[0];
    if (matchesPattern(refName, pattern)) {
      return item[pattern]; // возвращаем значение из объекта item, а не templates
    }
  }
  return null;
}

function fillTemplate(template, values) {
  return template.replace(/{{\s*([\w\.-]+)\s*}}/g, (match, key) => {
    return key in values ? values[key] : match;
  });
}

function flattenObject(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object') {
      Object.assign(acc, flattenObject(val, name));
    } else {
      acc[name] = val;
    }
    return acc;
  }, {});
}

// Objects
const selectedTemplateAndTag = {
  template: null,
  distTag: null,
  toString() {
    return `Template: ${this.template}, DistTag: ${this.distTag}`;
  }
};

async function run() {

  core.info(`pull_request head.ref: ${github.context.payload.pull_request?.head?.ref}`);
  core.info(`pull_request head: ${JSON.stringify(github.context.payload.pull_request?.head, null, 2)}`);
  let name = core.getInput('ref');

  if (!name) {
    name = github.context.eventName === 'pull_request' ? github.context.payload.pull_request?.head?.ref : github.context.ref;
  }

  core.info(`Ref: ${name}`);

  const debug = core.getInput('debug') === "true";
  const dryRun = core.getInput('dry-run') === "true";
  const showReport = core.getInput('show-report') === "true";
  const isDebug = debug === 'true' || debug === '1' || debug === 'yes' || debug === 'on';

  core.info(`Debug: ${isDebug}`);

  const ref = new RefExtractor().extract(name);

  const configurationPath = core.getInput('configuration-path') || "./.github/metadata-action-config.yml";
  const loader = new ConfigLoader()
  const config = loader.load(configurationPath, debug);

  const defaultTemplate = core.getInput('default-template') || config?.["default-template"] || `{{ref-name}}-{{timestamp}}-{{runNumber}}`;
  const defaultTag = core.getInput('default-tag') || config?.["default-tag"] || "latest";

  const extraTags = core.getInput('extra-tags');
  const mergeTags = core.getInput('merge-tags');

  core.info(`🔸 defaultTemplate: ${defaultTemplate}`);
  core.info(`🔸 defaultTag: ${defaultTag}`);

  // core.info(`🔹 Ref: ${JSON.stringify(ref)}`);

  if (loader.fileExists) {
    selectedTemplateAndTag.template = findTemplate(!ref.isTag ? ref.name : "tag", config["branches-template"]);
    selectedTemplateAndTag.distTag = findTemplate(ref.name, config["distribution-tag"]);
  }

  if (selectedTemplateAndTag.template === null) {
    core.info(`⚠️ No template found for ref: ${ref.name}, will be used default -> ${defaultTemplate}`);
    selectedTemplateAndTag.template = defaultTemplate;
  }

  if (selectedTemplateAndTag.distTag === null) {
    core.info(`⚠️ No dist-tag found for ref: ${ref.name}, will be used default -> ${defaultTag}`);
    selectedTemplateAndTag.distTag = defaultTag;
  }

  const parts = generateSnapshotVersionParts();
  const semverParts = extractSemverParts(ref.name);

  const shortShaDeep = +core.getInput("short-sha");
  if (!(shortShaDeep > 0)) {
    core.info(`⚠️ Invalid short-sha value: ${shortShaDeep}, will be used default -> 7`);
  }
  const shortSha = github.context.sha.slice(0, shortShaDeep);

  const values = {
    ...ref, "ref-name": ref.name, "short-sha": shortSha,
    ...semverParts, ...parts,
    "dist-tag": selectedTemplateAndTag.distTag,
    ...flattenObject({ github }, '')
  };

  core.info(`🔹 time: ${JSON.stringify(parts)}`);
  core.info(`🔹 semver: ${JSON.stringify(semverParts)}`);
  core.info(`🔹 dist-tag: ${JSON.stringify(selectedTemplateAndTag.distTag)}`);

  // core.info(`Values: ${JSON.stringify(values)}`); //debug values
  let result = fillTemplate(selectedTemplateAndTag.template, values)

  core.info(`🔹 Template: ${selectedTemplateAndTag.template}`);

  if (extraTags != '' && mergeTags == 'true') {
    core.info(`🔹 Merging extra tags: ${extraTags}`);
    result = result + ", " + extraTags;
  }

  core.info(`💡 Rendered template: ${result}`);

  core.setOutput("result", result);
  core.setOutput("ref", ref);
  core.setOutput("ref-name", ref.name);
  core.setOutput("date", parts.date);
  core.setOutput("time", parts.time);
  core.setOutput("Timestamp", parts.timestamp);
  core.setOutput("major", semverParts.major);
  core.setOutput("minor", semverParts.minor);
  core.setOutput("patch", semverParts.patch);
  core.setOutput("tag", selectedTemplateAndTag.distTag);
  core.setOutput("short-sha", shortSha);

  if (showReport) {
    const reportItem = {
      "ref": ref.name,
      "sha": github.context.sha,
      "shortSha": shortSha,
      "semver": `${semverParts.major}.${semverParts.minor}.${semverParts.patch}`,
      "timestamp": parts.timestamp,
      "template": selectedTemplateAndTag.template,
      "distTag": selectedTemplateAndTag.distTag,
      "extraTags": extraTags,
      "renderResult": result
    };
    await new Report().writeSummary(reportItem, dryRun);
  }
  core.info('✅ Action completed successfully!');
}

run();

module.exports = __webpack_exports__;
/******/ })()
;