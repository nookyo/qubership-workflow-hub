const core = require("@actions/core");
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

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
          tags: (v.metadata.container && v.metadata.container.tags) || [],
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
   * @param {Array<{ package: Object, versions: Array }>} params.packagesWithVersions
   * @param {string[]} params.excludedPatterns
   * @param {string[]} params.includedPatterns
   * @param {Date} params.thresholdDate
   * @param {Object} params.wrapper - octokit or docker registry wrapper
   * @param {string} params.owner
   * @param {boolean} params.isOrganization
   * @param {boolean} [params.debug=false]
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
    // 1) Распарсим вход (или просто используем готовый массив)
    const packages = await this.parse(packagesWithVersions);

    core.info(`Executing ContainerStrategy with ${packages.length} packages.`);

    // Здесь будем складывать результат
    const result = [];

    for (const pkg of packages) {
      // 2) Фильтруем версии по дате, excluded/included и т.д.
      // ... ваш существующий код фильтрации, получающий массив taggedToDelete

      const taggedToDelete = packages;

      if (!taggedToDelete.length) continue;

      // 3) Сбор manifest-digests для каждой tagged-версии
      const digestMap = new Map(); // version.digest -> Set<digest>
      for (const v of taggedToDelete) {
        const digs = new Set();
        for (const tag of v.tags) {
          try {
            // именно сюда попадает ваша функция
            const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
            ds.forEach((d) => digs.add(d));
            debug &&
              core.info(`Got ${ds.length} digests for ${pkg.name}:${tag}`);
          } catch (err) {
            core.warning(
              `Failed to fetch manifests for ${pkg.name}:${tag} — ${err.message}`,
            );
          }
        }
        digestMap.set(v.digest, digs);
      }

      // 4) По digestMap найдём все untagged-слои
      const layersToDelete = pkg.versions.filter(
        (v) =>
          v.tags.length === 0 &&
          Array.from(digestMap.values()).some((set) => set.has(v.digest)),
      );

      // 5) Соберём упорядоченный список: сначала tagged, потом связанные слои
      const ordered = [];
      const used = new Set();
      for (const v of taggedToDelete) {
        ordered.push(v);
        const digs = digestMap.get(v.digest) || new Set();
        for (const layer of layersToDelete) {
          if (!used.has(layer.digest) && digs.has(layer.digest)) {
            ordered.push(layer);
            used.add(layer.digest);
          }
        }
      }

      // 6) Добавим в итог, если есть что удалять
      if (ordered.length) {
        result.push({
          package: {
            id: pkg.id,
            name: pkg.name,
            type: pkg.packageType,
          },
          versions: ordered,
        });
        debug &&
          core.info(
            `To delete for ${pkg.name}: ` +
              ordered
                .map((v) => `${v.digest} [${v.tags.join(", ")}]`)
                .join(", "),
          );
      }
    }

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
