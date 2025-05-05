/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 90:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(958);
class Report {
    async writeSummary(filteredPackagesWithVersionsForDelete) {
        if (!filteredPackagesWithVersionsForDelete || filteredPackagesWithVersionsForDelete.length === 0) {
            core.info("❗️No packages or versions to delete.");
            return;
        }

        // Calculate summary statistics.
        const totalPackages = filteredPackagesWithVersionsForDelete.length;
        const totalDeletedVersions = filteredPackagesWithVersionsForDelete.reduce((total, item) => total + item.versions.length, 0);

        const tableData = [
            [
                { data: "Package", header: true },
                { data: "Deleted Versions", header: true }
            ]
        ];

        filteredPackagesWithVersionsForDelete.forEach(({ package: pkg, versions }) => {

            const pkgInfo = `<strong>${pkg.name}</strong>&#10;(ID: ${pkg.id})`;

            const versionsInfo = versions
                .map(v => `• <code>${v.id}</code> — ${v.metadata.container.tags.join(", ")}`)
                .join("<br>");

            tableData.push([pkgInfo, versionsInfo]);
        });

        core.summary.addRaw(`## 🎯 Container Package Cleanup Summary\n\n`);
        core.summary.addRaw(`**Total Packages Processed:** ${totalPackages}
                             **Total Deleted Versions:** ${totalDeletedVersions}\n\n`);
        core.summary.addRaw(`---\n\n`);
        core.summary.addTable(tableData);
        core.summary.addRaw(`\n\n✅ Cleanup operation completed successfully.`);

        await core.summary.write();
    }
}

module.exports = Report;

/***/ }),

/***/ 937:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const github = __nccwpck_require__(394);

class OctokitWrapper {

  /**
   * Initializes the OctokitWrapper with an authentication token.
   * @param {string} authToken - The GitHub authentication token.
   */
  constructor(authToken) {
    this.octokit = github.getOctokit(authToken);
  }

  /**
   * Determines if the given username belongs to an organization.
   * @param {string} username - The username to check.
   * @returns {Promise<boolean>} - True if the username belongs to an organization, false otherwise.
   */
  async isOrganization(username) {
    try {
      const response = await this.octokit.rest.users.getByUsername({ username });
      return response.data.type !== 'User' ? true : false;
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Lists packages for a user or organization.
   * @param {string} owner - The username or organization name.
   * @param {string} package_type - The type of the package (e.g., container).
   * @param {boolean} type - True if the owner is an organization, false if it's a user.
   * @returns {Promise<Array>} - A list of packages.
   */
  async listPackages(owner, package_type, type) {
    return type ? this.listPackagesForOrganization(owner, package_type) : this.listPackagesForUser(owner, package_type);
  }

  /**
   * Lists versions for a specific package owned by a user or organization.
   * @param {string} owner - The username or organization name.
   * @param {string} package_type - The type of the package (e.g., container).
   * @param {string} package_name - The name of the package.
   * @param {boolean} type - True if the owner is an organization, false if it's a user.
   * @returns {Promise<Array>} - A list of package versions.
   */
  async listVersionsForPackage(owner, package_type, package_name, type) {
    return type ? this.getPackageVersionsForOrganization(owner, package_type, package_name) : this.getPackageVersionsForUser(owner, package_type, package_name);
  }

  /**
   * Lists packages for an organization.
   * @param {string} org - The organization name.
   * @param {string} package_type - The type of the package (e.g., container).
   * @returns {Promise<Array>} - A list of packages.
   */
  async listPackagesForOrganization(org, package_type) {
    try {
      const response = await this.octokit.rest.packages.listPackagesForOrganization({ org, package_type });
      return response.data;
    } catch (error) {
      console.error(`Error fetching packages for organization ${org}:`, error);
      throw error;
    }
  }

  /**
   * Lists packages for a user.
   * @param {string} username - The username.
   * @param {string} package_type - The type of the package (e.g., container).
   * @returns {Promise<Array>} - A list of packages.
   */
  async listPackagesForUser(username, package_type) {
    try {
      const response = await this.octokit.rest.packages.listPackagesForUser({ username, package_type });
      return response.data;
    } catch (error) {
      console.error(`Error fetching packages for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Gets all versions of a specific package owned by a user.
   * @param {string} owner - The username.
   * @param {string} package_type - The type of the package (e.g., container).
   * @param {string} package_name - The name of the package.
   * @returns {Promise<Array>} - A list of package versions.
   */
  async getPackageVersionsForUser(owner, package_type, package_name) {
    try {
      const response = await this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser({
        package_type,
        package_name,
        username: owner,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching package versions for ${owner}/${package_name}:`, error);
      throw error;
    }
  }

  /**
   * Gets all versions of a specific package owned by an organization.
   * @param {string} org - The organization name.
   * @param {string} package_type - The type of the package (e.g., container).
   * @param {string} package_name - The name of the package.
   * @returns {Promise<Array>} - A list of package versions.
   */
  async getPackageVersionsForOrganization(org, package_type, package_name) {
    try {
      const response = await this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
        package_type,
        package_name,
        org,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching package versions for ${org}/${package_name}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a specific package version.
   * @param {string} owner - The username or organization name.
   * @param {string} package_type - The type of the package (e.g., container).
   * @param {string} package_name - The name of the package.
   * @param {string} version_id - The unique identifier of the version to delete.
   * @param {boolean} type - True if the owner is an organization, false if it's a user.
   * @returns {Promise<void>}
   */
  async deletePackageVersion(owner, package_type, package_name, package_version_id, type) {
    try {
      if (type) {
        await this.octokit.rest.packages.deletePackageVersionForOrg({
          package_type,
          package_name,
          package_version_id,
          org: owner,
        });
      } else {
        await this.octokit.rest.packages.deletePackageVersionForUser({
          package_type,
          package_name,
          package_version_id,
          username: owner,
        });
      }
    } catch (error) {
      console.error(`Error deleting package version ${package_version_id} for ${owner}/${package_name}:`, error);
      throw error;
    }
  }

}

module.exports = OctokitWrapper;

/***/ }),

/***/ 958:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 394:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


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
const OctokitWrapper = __nccwpck_require__(937);
const Report = __nccwpck_require__(90);

async function run() {

  // const configurationPath = core.getInput('config-file-path');

  // if (configurationPath === "") {
  //   core.info("❗️ Configuration file path is empty. Try to using default path: ./.github/package-cleanup-config.yml");
  //   configurationPath = "./.github/package-cleanup-config.yml";
  // }

  const isDebug = core.getInput("debug").toLowerCase() === "true";
  const dryRun = core.getInput("dry-run").toLowerCase() === "true";
  core.info(`🔹isDebug: ${isDebug}`);
  core.info(`🔹dryRun: ${dryRun}`);

  const thresholdDays = parseInt(core.getInput('threshold-days'), 10) || 7;

  const rawIncludedTags = core.getInput('included-tags');
  const includedTags = rawIncludedTags ? rawIncludedTags.split(",") : [];

  const rawExcludedTags = core.getInput('excluded-tags');
  const excludedTags = rawExcludedTags ? rawExcludedTags.split(",") : [];

  const now = new Date();
  const thresholdDate = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);

  // core.info(`🔹Configuration Path: ${configurationPath}`);
  core.info(`🔹 Threshold Days: ${thresholdDays}`);
  core.info(`🔹 Threshold Date: ${thresholdDate}`);
  core.info(`🔹 Excluded Tags: ${excludedTags}`);
  core.info(`🔹 Included Tags: ${includedTags}`);

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const wrapper = new OctokitWrapper(process.env.PACKAGE_TOKEN);

  const isOrganization = await wrapper.isOrganization(owner);
  core.info(`🔹Organization marker: ${isOrganization}`);

  let packages = await wrapper.listPackages(owner, 'container', isOrganization);
  let filteredPackages = packages.filter((pkg) => pkg.repository.name === repo);

  let packagesNames = filteredPackages.map((pkg) => pkg.name);

  const packagesWithVersions = await Promise.all(
    filteredPackages.map(async (pkg) => {
      const versionsForPkg = await wrapper.listVersionsForPackage(owner, pkg.package_type, pkg.name, isOrganization);
      return { package: pkg, versions: versionsForPkg };
    })
  );

  let filteredPackagesWithVersionsForDelete = packagesWithVersions.map(({ package: pkg, versions }) => {

    const verisonWithOutExclude = versions.filter((version) => {
      const createdAt = new Date(version.created_at);
      const isOldEnough = createdAt <= thresholdDate;

      if (!isOldEnough) return false;
      if (!version.metadata || !version.metadata.container || !Array.isArray(version.metadata.container.tags)) return false;
      const tags = version.metadata.container.tags;

      if (excludedTags.length > 0 && tags.some(tag => excludedTags.some(pattern => wildcardMatch(tag, pattern)))) {
        return false;
      }
      return true;
    });

    const versionsToDelete = includedTags.length > 0 ? verisonWithOutExclude.filter((version) => {
      if (!version.metadata || !version.metadata.container || !Array.isArray(version.metadata.container.tags)) return false;
      const tags = version.metadata.container.tags;
      return tags.some(tag => includedTags.some(pattern => wildcardMatch(tag, pattern)));
    }) : verisonWithOutExclude;

    const customPackage = {
      id: pkg.id,
      name: pkg.name,
      type: pkg.package_type
    };

    return { package: customPackage, versions: versionsToDelete };

  }).filter(item => item !== null && item.versions.length > 0);

  if (filteredPackagesWithVersionsForDelete.length === 0) {
    core.info("❗️ No versions to delete.");
    return;
  }

  if (isDebug) {
    core.info(`💡 Packages name: ${JSON.stringify(packagesNames, null, 2)}`);
    core.info(`::group::Delete versions Log.`);
    core.info(`💡 Package with version for delete: ${JSON.stringify(filteredPackagesWithVersionsForDelete, null, 2)}`);
    core.info(`::endgroup::`);
  }

  if (dryRun) {
    core.warning("Dry run mode enabled. No versions will be deleted.");
    await showReport(filteredPackagesWithVersionsForDelete);
    return;
  }

  for (const { package: pkg, versions } of filteredPackagesWithVersionsForDelete) {
    for (const version of versions) {
      core.info(`🔹 Package: ${pkg.name} (${pkg.type}) deleting version: ${version.id} (${version.metadata.container.tags.join(", ")})`);
      await wrapper.deletePackageVersion(owner, 'container', pkg.name, version.id, isOrganization);
    }
  }

  await showReport(filteredPackagesWithVersionsForDelete);
}

function wildcardMatch(tag, pattern) {
  if (!pattern.includes('*')) {
    return tag.toLowerCase() === pattern.toLowerCase();
  }
  const escapedPattern = pattern.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(escapedPattern.replace(/\*/g, '.*'), 'i');
  return regex.test(tag);
}

async function showReport(packagesWithVersionsForDelete) {
  await new Report().writeSummary(filteredPackagesWithVersionsForDelete);
  core.info("✅ All specified versions have been deleted successfully.");
}

run();

module.exports = __webpack_exports__;
/******/ })()
;