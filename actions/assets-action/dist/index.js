/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 631:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(958);
const fs = __nccwpck_require__(896);
const path = __nccwpck_require__(928);
const archiver = __nccwpck_require__(813);


async function addToArchive(itemPath, archiveType) {

    const stat = await fs.promises.stat(itemPath);
    if (!stat.isDirectory()) {
        return itemPath;
    }

    const archiveName = `${path.basename(itemPath)}.${archiveType}`;
    const archivePath = path.join(path.dirname(itemPath), archiveName);

    const output = fs.createWriteStream(archivePath);
    const archive = archiver(archiveType, { zlib: { level: 9 } });

    const archiveClosed = new Promise((resolve, reject) => {
        output.on("close", () => {
            core.info(`Archive created: ${archivePath}`);
            resolve();
        });
        archive.on("error", (err) => {
            reject(new Error(`Archive error: ${err.message}`));
        });
    });

    archive.pipe(output);
    archive.directory(itemPath, false);

    await archive.finalize();
    await archiveClosed;

    return archivePath;
}

async function createDir(name) {
    const dirPath = path.join(process.cwd(), name);
    try {
        await fs.promises.mkdir(dirPath, { recursive: true });
        core.info(`Directory created: ${dirPath}`);
    } catch (error) {
        throw new Error(`Failed to create directory: ${error.message}`);
    }
    return dirPath;
}

module.exports = {
    addToArchive,
    createDir,
};

/***/ }),

/***/ 15:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { execSync } = __nccwpck_require__(317);
const path = __nccwpck_require__(928);
const core = __nccwpck_require__(958);

class AssetUploader {
    constructor(token, releaseTag, owner, repo) {
        this.token = token;
        this.releaseTag = releaseTag;
        this.owner = owner;
        this.repo = repo;
    }

    async toString() {
        return `AssetUploader: { owner: ${this.owner}, repo: ${this.repo}, releaseTag: ${this.releaseTag} }`;
    }

    async upload(assetPath) {
        if (!this.owner || !this.repo || !this.releaseTag) {
            throw new Error(`❗️ Incorrect initialization of AssetUploader: { owner: ${this.owner}, repo: ${this.repo}, releaseTag: ${this.releaseTag} }`);
        }

        const fileName = path.basename(assetPath);
        const absPath = path.resolve(assetPath);
        const repoArg = `${this.owner}/${this.repo}`;

        try {
            const cmd = [
                "gh", "release", "upload",
                this.releaseTag,
                `"${absPath}"`,
                "--repo", repoArg,
                "--clobber"
            ].join(" ");

            core.info(`Try Uploading asset: ${fileName} to release: ${this.releaseTag} in repo: ${repoArg}`);
            execSync(cmd, { stdio: "inherit", env: process.env });
            core.info(`✔️ Asset uploaded successfully: ${fileName} \n`);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = AssetUploader;

/***/ }),

/***/ 90:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(958);

class Report {

    async writeSummary(items, owner, repo, releaseTag) {

        if (!Array.isArray(items) || items.length === 0) {
            core.info("❗️ No assets processed.");
            return;
        }

        core.summary.addRaw(`## 🧪 Report Summary\n\n`);
        core.summary.addRaw(`**Owner:** ${owner}  \n`);
        core.summary.addRaw(`**Repo:** ${repo}  \n`);
        core.summary.addRaw(`**Release Tag:** \`${releaseTag}\`  \n\n`);
        core.summary.addRaw(`---\n\n`);

        const tableData = [
            [
                { data: "Item", header: true },
                { data: "Asset", header: true },
                { data: "Status", header: true },
                { data: "Message", header: true }
            ]
        ];

        let statusCell = '';

         items.forEach(({ itemPath, fileName, success, error }) => {
            const displayName = fileName || "-";
            switch (success) {
                case "Success":
                    statusCell = "✅ Uploaded";
                    break;
                case "Failed":
                    statusCell = `❗️ Failed`;
                    break;
                case "NotFound":
                    statusCell = "⚠️ NotFound";
                    break;
                default:
                    statusCell = `❗️  Status unknown`;
            }

            tableData.push([itemPath, displayName, statusCell, error || "-"]);
        });

        core.summary.addTable(tableData);
        await core.summary.write();
    }
}

module.exports = Report;


/***/ }),

/***/ 36:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const core = __nccwpck_require__(958);

   async function retryAsync(fn, options = {}) {
    let { retries = 3, delay = 1000, factor = 1 } = options;

    let constDelay = delay;
    while (retries > 0) {
        try {
            return await fn();
        } catch (error) {
            retries--;
            if (retries === 0) {
                throw error;
            }
            console.info(`⚠️ Retrying due to error: ${error.message}. Retries left: ${retries}. Delay: ${constDelay}ms`);
            constDelay *= factor; // Increase delay for next retry
            await new Promise(resolve => setTimeout(resolve, constDelay));
        }
    }
    throw new Error("❗️ Unknow error. All retries failed.");
}

exports.retryAsync = retryAsync;

/***/ }),

/***/ 958:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 394:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 813:
/***/ ((module) => {

module.exports = eval("require")("archiver");


/***/ }),

/***/ 317:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

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
// actions/assets-action/src/index.js
const core = __nccwpck_require__(958);
const github = __nccwpck_require__(394);
const fs = __nccwpck_require__(896);
const path = __nccwpck_require__(928);
const { addToArchive } = __nccwpck_require__(631);
const AssetUploader = __nccwpck_require__(15);
const { retryAsync } = __nccwpck_require__(36);
const Report = __nccwpck_require__(90);

async function getInput() {
  return {
    releaseTag: core.getInput("tag", { required: true }),
    archiveType: core.getInput("archive-type").trim() || "zip",
    itemPath: core.getInput("item-path").trim(),
    retries: parseInt(core.getInput("retries"), 10) || 3,
    delay: parseInt(core.getInput("retry-delay-ms"), 10) || 1000,
    factor: parseFloat(core.getInput("factor")) || 1,
    dryRun: core.getInput("dry-run") === "true"
  };
}

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const input = await getInput();
    const { owner, repo } = github.context.repo;

    if (!owner || !repo) {
      throw new Error("❗️ Failed to get owner/repo from github.context.repository");
    }

    // Split itemPath into an array of paths (comma-separated)
    const itemsPath = input.itemPath.split(",").map((p) => p.trim()).filter(Boolean);

    if (itemsPath.length === 0) {
      throw new Error("❗️ No file or folder paths provided for processing");
    }

    const assetsUploader = new AssetUploader(token, input.releaseTag, owner, repo);
    if (!assetsUploader) {
      throw new Error("❗️ Failed to initialize AssetUploader");
    }

    core.info(`🔹 Using archive type: ${input.archiveType}`);
    core.info(`🔹 Items to process: ${itemsPath.join(", ")}`);

    // Collect information for the final report
    const reportEntries = [];

    for (const itemPath of itemsPath) {

      core.info(`🔸 Processing item: ${itemPath}`);

      if (!fs.existsSync(itemPath)) {
        core.info(`⚠️ File or folder not found: ${itemPath}. \n Skipping... \n`);

        reportEntries.push({
          fileName: null,
          itemPath,
          success: "NotFound",
          error: `File or folder not found: ${itemPath}`
        });

        continue;
      }

      // Default to the item path if not archiving
      let archivePath = itemPath;

      if (fs.statSync(itemPath).isDirectory()) {
        try {
          archivePath = await addToArchive(itemPath, input.archiveType);

        } catch (archiveErr) {
          core.error(`Error packaging ${itemPath}: ${archiveErr.message}`);

          reportEntries.push({
            fileName: null,
            itemPath,
            success: "Error",
            error: `Error packaging ${itemPath}: ${archiveErr.message}`
          });

          continue;
        }
      }

      // Attempt to upload the archive or file
      try {
        await retryAsync(() => Promise.resolve(assetsUploader.upload(archivePath)),
          {
            retries: input.retries,
            delay: input.delay,
            factor: input.factor
          });

        reportEntries.push({
          fileName: path.basename(archivePath),
          itemPath,
          success: "Success",
          error: ''
        });

      } catch (uploadErr) {
        core.info(`Failed to upload asset: ${archivePath}. ${uploadErr.message}`);

        reportEntries.push({
          fileName: path.basename(archivePath),
          itemPath,
          success: "Failed",
          error: `Failed to upload asset: ${archivePath}. ${uploadErr.message}`
        });

      }
    }

    // Generate the final report (table) and write the Summary
    const report = new Report();
    await report.writeSummary(reportEntries, owner, repo, input.releaseTag);

    reportEntries.forEach(element => {
      core.info(`Report Entry: ${JSON.stringify(element)}`);
    });

    core.info("✅ Action completed successfully!");
  } catch (err) {
    core.setFailed(`❌ Error: ${err.message}`);
  }
}

run();

module.exports = __webpack_exports__;
/******/ })()
;