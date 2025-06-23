const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("./wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = "Container Strategy";
  }

  execute({
    packagesWithVersions,
    excludedTags,
    includedTags,
    thresholdDate,
    debug = false,
  }) {
    const wildcardMatcher = new WildcardMatcher();

    let filteredPackagesWithVersionsForDelete = packagesWithVersions
      .map(({ package: pkg, versions }) => {
        const versionsWithoutExclude = versions.filter((version) => {
          const createdAt = new Date(version.created_at);
          const isOldEnough = createdAt <= thresholdDate;

          if (!isOldEnough) return false;
          if (!this.isValidMetadata(version)) return false;
          const tags = version.metadata.container.tags;

          if (
            excludedTags.length > 0 &&
            tags.some((tag) =>
              excludedTags.some((pattern) =>
                wildcardMatcher.match(tag, pattern),
              ),
            )
          ) {
            return false;
          }
          return true;
        });

        const versionsToDelete =
          includedTags.length > 0
            ? versionsWithoutExclude.filter((version) => {
                const tags = version.metadata.container.tags;
                return tags.some((tag) =>
                  includedTags.some((pattern) =>
                    wildcardMatcher.match(tag, pattern),
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
