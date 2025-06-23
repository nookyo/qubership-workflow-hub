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
    // includedTags = ['*SNAPSHOT*', ...includedTags];
    const wildcardMatcher = new WildcardMatcher();

    let filteredPackagesWithVersionsForDelete = packagesWithVersions
      .map(({ package: pkg, versions }) => {
        if (versions.length === 1) return null;
        let versionForDelete = versions.filter((version) => {
          const createdAt = new Date(version.created_at);
          const isOldEnough = createdAt <= thresholdDate;

          debug &&
            core.info(
              `Checking package: ${pkg.name} version: ${version.name}, created at: ${createdAt}, Threshold date: ${thresholdDate}, Is old enough: ${isOldEnough}`,
            );

          if (!isOldEnough) return false;

          if (
            excludedTags.some((pattern) =>
              wildcardMatcher.match(version.name, pattern),
            )
          )
            return false;

          return includedTags.some((pattern) =>
            wildcardMatcher.match(version.name, pattern),
          );
        });

        if (versionForDelete.length === 0) {
          debug &&
            core.info(
              `No versions found for package: ${pkg.name} that match the criteria.`,
            );
          return null;
        }

        let customPackage = {
          id: pkg.id,
          name: pkg.name,
          type: pkg.package_type,
        };

        return { package: customPackage, versions: versionForDelete };
      })
      .filter(Boolean);

    // debug && core.info(`Filtered packages with Maven type: ${JSON.stringify(filteredPackagesWithVersionsForDelete, null, 2)}`);

    return filteredPackagesWithVersionsForDelete;
  }

  async toString() {
    return this.name;
  }
}

module.exports = MavenStrategy;
