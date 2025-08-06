const core = require("@actions/core");
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

const { deletePackageVersion } = require("../utils/deleteAction");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = "Container Strategy";
    this.wildcardMatcher = new WildcardMatcher();
  }

  async parse(raw) {
    try {
      const data = Array.isArray(raw) ? raw : JSON.parse(raw);

      return data.map(({ package: pkg, versions }) => ({
        id: pkg.id,
        name: pkg.name,
        packageType: pkg.package_type,
        repository: pkg.repository.full_name,
        createdAt: pkg.created_at,
        updatedAt: pkg.updated_at,

        versions: versions.map((v) => ({
          id: v.id,
          name: v.name,
          metadata: {
            container: {
              tags: Array.isArray(v.metadata?.container?.tags)
                ? v.metadata.container.tags
                : [],
            },
          },
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        })),
      }));
    } catch (err) {
      core.setFailed(`Action failed: ${err.message}`);
    }
  }

  /**
   * @param {Object} params
   * @param {Array<{ package: Object, versions: Array }>|string} params.packagesWithVersions
   * @param {string[]} params.excludedPatterns
   * @param {string[]} params.includedPatterns
   * @param {Date} params.thresholdDate
   * @param {Object} params.wrapper - octokit or docker registry wrapper (должен иметь getManifestDigests)
   * @param {string} params.owner
   * @param {boolean} params.isOrganization
   * @param {boolean} [params.debug=false]
   * @returns {Promise<Array>}  // пока возвращаем исходное packagesWithVersions
   */
  async execute({
    packagesWithVersions,
    excludedPatterns,
    includedPatterns,
    thresholdDate,
    wrapper,
    owner,
    isOrganization,
    debug = false,
  }) {
    // Паттерны пока не используем для dangling
    const excluded = (excludedPatterns || []).map((p) => p.toLowerCase());
    const included = (includedPatterns || []).map((p) => p.toLowerCase());

    core.info(
      `Executing ContainerStrategy with ${Array.isArray(packagesWithVersions) ? packagesWithVersions.length : "unknown"} packages.`,
    );

    // 1) Распарсим вход (может быть строкой JSON или уже массивом)
    const packages = await this.parse(packagesWithVersions);
    console.log("Parsed packages:", JSON.stringify(packages, null, 2));

    const dangling = [];

    for (const pkg of packages) {
      const archDigests = new Set();
      const uniqueTags = new Set();

      // Собираем все защищённые digests из manifest-list
      for (const v of pkg.versions) {
        const tagList = v.metadata.container.tags;
        if (tagList.length) {
          archDigests.add(v.name);
          tagList.forEach((t) => uniqueTags.add(t));
        }
      }
      for (const tag of uniqueTags) {
        const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
        // …добавляем в archDigests…
      }

      // Фильтруем «dangling» версии
      const danglingForPkg = pkg.versions.filter(
        (v) =>
          v.metadata.container.tags.length === 0 && !archDigests.has(v.name),
      );

      if (danglingForPkg.length) {
        dangling.push({
          package: { id: pkg.id, name: pkg.name, type: pkg.packageType },
          versions: danglingForPkg,
        });
        debug &&
          core.info(
            `[dangling] ${pkg.name}: ${danglingForPkg.length} → ${danglingForPkg.map((v) => v.name).join(", ")}`,
          );
      }
    }

    core.info(`Dangling candidates:\n${JSON.stringify(dangling, null, 2)}`);

    //core.info(`PackageWithVersions for delete: ${JSON.stringify(packages, null, 2)}`);

    // let  t = deletePackageVersion(dangling);

    const result = packagesWithVersions;

    return result;
  }

  isValidMetadata(version) {
    return Array.isArray(version?.metadata?.container?.tags);
  }

  toString() {
    return this.name;
  }
}

module.exports = ContainerStrategy;
