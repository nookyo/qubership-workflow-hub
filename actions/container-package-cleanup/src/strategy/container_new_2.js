const core = require("@actions/core");
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = "Container Strategy";
    this.wildcardMatcher = new WildcardMatcher();
  }

  /**
   * @param {Object} params
   * @param {Array<{package: Object, versions: Array}>} params.packagesWithVersions
   * @param {Array<string>} params.excludedPatterns
   * @param {Array<string>} params.includedPatterns
   * @param {Date} params.thresholdDate
   * @param {Object} params.wrapper  // должен реализовывать getManifest(owner, repo, tag, isOrg)
   * @param {string} params.owner
   * @param {boolean} params.isOrganization
   * @param {boolean} [params.debug]
   * @returns {Promise<Array>}
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
    const excluded = excludedPatterns.map((p) => p.toLowerCase());
    const included = includedPatterns.map((p) => p.toLowerCase());

    const result = [];

    for (const { package: pkg, versions } of packagesWithVersions) {
      if (!Array.isArray(versions)) {
        core.warning(`Package ${pkg.name} has no versions array`);
        continue;
      }

      // 1) фильтрация по дате и excludedPatterns
      const withoutExclude = versions.filter((v) => {
        if (!Array.isArray(v.metadata?.container?.tags)) return false;
        const created = new Date(v.created_at);
        if (created > thresholdDate) return false;
        const tags = v.metadata.container.tags;
        return (
          !excluded.some((pattern) =>
            tags.some((tag) => this.wildcardMatcher.match(tag, pattern)),
          ) && !tags.includes("latest")
        );
      });

      // 2) из оставшихся берём tagged-версии по includedPatterns (или все, если include пуст)
      const taggedToDelete =
        included.length > 0
          ? withoutExclude.filter((v) =>
              v.metadata.container.tags.some((tag) =>
                included.some((pattern) =>
                  this.wildcardMatcher.match(tag, pattern),
                ),
              ),
            )
          : withoutExclude.filter((v) => v.metadata.container.tags.length > 0);

      // 3) собираем реальные layer-digests из манифестов tagged-образов
      const digestMap = new Map(); // version.name -> Set(layerDigest)
      for (const v of taggedToDelete) {
        const digs = new Set();
        for (const tag of v.metadata.container.tags) {
          try {
            // получить полный манифест образа
            const manifest = await wrapper.getManifest(
              owner,
              pkg.name,
              tag,
              isOrganization,
            );
            if (Array.isArray(manifest.layers)) {
              manifest.layers.forEach((layer) => {
                if (layer.digest) digs.add(layer.digest);
              });
            }
          } catch (e) {
            debug &&
              core.debug(
                `Failed to fetch manifest ${pkg.name}:${tag} — ${e.message}`,
              );
          }
        }
        digestMap.set(v.name, digs);
      }

      // 4) среди без-тегов ищем те слои, которые встречаются в любом tagged-манифесте
      const layersToDelete = withoutExclude.filter(
        (v) =>
          v.metadata.container.tags.length === 0 &&
          Array.from(digestMap.values()).some((digs) => digs.has(v.name)),
      );

      // 5) итоговый упорядоченный список: сначала tagged-версии, затем их слои
      const ordered = [];
      const used = new Set();
      for (const v of taggedToDelete) {
        ordered.push(v);
        const digs = digestMap.get(v.name) || new Set();
        for (const layer of layersToDelete) {
          if (!used.has(layer.name) && digs.has(layer.name)) {
            ordered.push(layer);
            used.add(layer.name);
          }
        }
      }

      if (ordered.length === 0) {
        debug && core.info(`Nothing to delete for ${pkg.name}`);
        continue;
      }

      result.push({
        package: { id: pkg.id, name: pkg.name, type: pkg.package_type },
        versions: ordered,
      });
      debug &&
        core.info(
          `To delete for ${pkg.name}: ${ordered.map((v) => v.name).join(", ")}`,
        );
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
