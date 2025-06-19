const core = require("@actions/core");
const WildcardMatcher = require("./wildcardMatcher");

class MavenStrategy {
  constructor() {
    this.name = "ManevStrategy";
  }

  async execute({
    packagesWithVersions,
    excludedTags,
    includedTags,
    thresholdDate,
    debug = false,
  }) {
    includedTags = ["*SNAPSHOT*", ...includedTags];
    const wildcardMatcher = new WildcardMatcher();

    let filteredPackagesWithVersionsForDelete = packagesWithVersions
      .map(({ package: pkg, versions }) => {
        let versionForDelete = versions.filter((version) => {
          const createdAt = new Date(version.created_at);
          const isOldEnough = createdAt <= thresholdDate;

          debug && core.info(`::group:: Package version check.`);
          debug &&
            core.info(
              `Checking package: ${pkg.name} version: ${version.name}, created at: ${createdAt}, Threshold date: ${thresholdDate}, Is old enough: ${isOldEnough}`,
            );
          debug && core.info(`::endgroup::`);

          if (!isOldEnough) return false;

          return includedTags.some((pattern) =>
            wildcardMatcher.match(version.name, pattern),
          );
        });

        if (versionForDelete.length === 0) {
          debug &&
            core.info(
              `No versions found for package: ${pkg.name} that match the criteria.`,
            );
          return false;
        }

        let customPackage = {
          id: pkg.id,
          name: pkg.name,
          type: pkg.package_type,
        };

        return { package: customPackage, versions: versionForDelete };
      })
      .filter(
        (item) =>
          item !== null && item != undefined && item.versions.length > 0,
      );

    // debug && core.info(`Filtered packages with Maven type: ${JSON.stringify(filteredPackagesWithVersionsForDelete, null, 2)}`);

    return filteredPackagesWithVersionsForDelete;
  }

  async toString() {
    return this.name;
  }
}

module.exports = MavenStrategy;
