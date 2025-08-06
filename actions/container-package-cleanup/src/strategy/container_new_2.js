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

      const packages = data.map(({ package: pkg, versions }) => ({
        id: pkg.id,
        name: pkg.name,
        packageType: pkg.package_type,
        repository: pkg.repository.full_name,
        createdAt: pkg.created_at,
        updatedAt: pkg.updated_at,

        // Версии — массив объектов с id, digest (имя) и тегами
        versions: versions.map((v) => ({
          id: v.id,
          digest: v.name,
          // Если tags придут не массивом, ниже в execute мы дополнительно нормализуем
          tags:
            (v.metadata && v.metadata.container && v.metadata.container.tags) ||
            [],
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        })),
      }));

      return packages;
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

      // Собираем digest'ы всех текущих тегов и список уникальных тегов
      for (const v of pkg.versions) {
        const tags = Array.isArray(v.tags) ? v.tags : [];
        if (tags.length > 0) {
          // Защищаем digest тегнутой версии (single-arch или manifest-list)
          archDigests.add(v.digest);
          tags.forEach((t) => uniqueTags.add(t));
        }
      }

      // Добавляем платформенные digest'ы из manifest-list для каждого тега
      for (const tag of uniqueTags) {
        try {
          const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
          if (Array.isArray(ds)) {
            ds.forEach((d) => archDigests.add(d));
          } else if (ds) {
            archDigests.add(ds);
          }
          debug &&
            core.info(`[digests] ${pkg.name}:${tag} -> ${JSON.stringify(ds)}`);
        } catch (e) {
          core.warning(
            `Failed to fetch manifests for ${pkg.name}:${tag} — ${e.message}`,
          );
        }
      }

      const danglingForPkg = pkg.versions.filter((v) => {
        const tags = Array.isArray(v.tags) ? v.tags : [];
        return tags.length === 0 && !archDigests.has(v.digest);
      });

      if (danglingForPkg.length > 0) {
        dangling.push({
          package: {
            id: pkg.id,
            name: pkg.name,
            type: pkg.packageType,
          },
          versions: danglingForPkg.map((v) => ({
            id: v.id,
            name: v.digest,
            metadata: {
              container: { tags: Array.isArray(v.tags) ? v.tags : [] },
            },
          })),
        });
        debug &&
          core.info(
            `[dangling] ${pkg.name}: ${danglingForPkg.length} -> ${danglingForPkg.map((v) => v.digest).join(", ")}`,
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
