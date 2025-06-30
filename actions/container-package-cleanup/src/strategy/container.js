const core = require("@actions/core");
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = "Container Strategy";
    this.wildcardMatcher = new WildcardMatcher();
  }

  execute({
    packagesWithVersions,
    excludedPatterns,
    includedPatterns,
    thresholdDate,
    debug = false,
  }) {
    const excludePatterns = excludedPatterns.map((p) => p.toLowerCase());
    const includePatterns = includedPatterns.map((p) => p.toLowerCase());
    const createdAt = new Date(version.created_at);

    debug &&
      core.debug(
        `Package with versions: ${JSON.stringify(packagesWithVersions, null, 2)}`,
      );

    let filteredPackagesWithVersionsForDelete = packagesWithVersions
      .map(({ package: pkg, versions }) => {
        const versionsWithoutExclude = versions.filter((version) => {
          if (!this.isValidMetadata(version)) return false;

          const isOldEnough = createdAt <= thresholdDate;

          debug &&
            core.debug(
              `Checking package: ${pkg.name} version: ${version.name}, created at: ${createdAt}, Threshold date: ${thresholdDate}, Is old enough: ${isOldEnough}`,
            );

          if (!isOldEnough) return false;

          const tags = version.metadata.container.tags || [];

          if (
            excludePatterns.length > 0 &&
            tags.some((tag) =>
              excludePatterns.some((pattern) =>
                this.wildcardMatcher.match(tag, pattern),
              ),
            )
          ) {
            return false;
          }
          return true;
        });

        const versionsToDelete =
          includePatterns.length > 0
            ? versionsWithoutExclude.filter((version) => {
                const tags = version.metadata.container.tags;

                if (tags.length === 0 && version.name.startsWith("sha256:"))
                  return true;

                return tags.some((tag) =>
                  includePatterns.some((pattern) =>
                    this.wildcardMatcher.match(tag, pattern),
                  ),
                );
              })
            : versionsWithoutExclude;

        const customPackage = {
          id: pkg.id,
          name: pkg.name,
          type: pkg.package_type,
        };

        return { package: customPackage, versions: versionsToDelete };
      })
      .filter((item) => item !== null && item.versions.length > 0);

    return filteredPackagesWithVersionsForDelete;
  }

  isValidMetadata(version) {
    return Array.isArray(version?.metadata?.container?.tags);
  }

  toString() {
    return this.name;
  }
}

module.exports = ContainerStrategy;
