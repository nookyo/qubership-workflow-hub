const core = require('@actions/core');
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = 'Container Strategy';
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
        versions: (versions || []).map(v => ({
          id: v.id,
          name: v.name,
          metadata: {
            container: {
              tags: Array.isArray(v.metadata?.container?.tags)
                ? v.metadata.container.tags
                : []
            }
          },
          createdAt: v.created_at,
          updatedAt: v.updated_at
        }))
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
   * @param {Object} params.wrapper — должен иметь getManifestDigests(owner, repo, tag)
   * @param {string} params.owner
   * @param {boolean} params.isOrganization
   * @param {boolean} [params.debug=false]
   * @returns {Promise<Array<{ package: Object, versions: Array }>>}
   */
  async execute({
    packagesWithVersions,
    excludedPatterns = [],
    includedPatterns = [],
    thresholdDate,
    wrapper,
    owner,
    isOrganization,
    debug = false
  }) {
    core.info(`Executing ContainerStrategy with ${Array.isArray(packagesWithVersions) ? packagesWithVersions.length : 'unknown'} packages.`);

    const excluded = excludedPatterns.map(p => p.toLowerCase());
    const included = includedPatterns.map(p => p.toLowerCase());

    const packages = await this.parse(packagesWithVersions);
    const result = [];

    for (const pkg of packages) {
      // 1) фильтруем версии по дате и excludedPatterns
      const withoutExclude = pkg.versions.filter(v => {
        // только контейнеры с валидными метаданными
        if (!Array.isArray(v.metadata.container.tags)) return false;
        if (new Date(v.createdAt) > thresholdDate) return false;
        const tags = v.metadata.container.tags;
        // убрать любые, что попадают под excludedPatterns или «latest»
        if (tags.includes('latest')) return false;
        if (excluded.some(pat => tags.some(t => this.wildcardMatcher.match(t, pat)))) {
          return false;
        }
        return true;
      });

      // 2) из оставшихся выбираем tagged-версии по включению
      const taggedToDelete = included.length > 0
        ? withoutExclude.filter(v =>
            v.metadata.container.tags.some(t =>
              included.some(pat => this.wildcardMatcher.match(t, pat))
            )
          )
        : withoutExclude.filter(v => v.metadata.container.tags.length > 0);

      if (debug) {
        core.info(`Package ${pkg.name}: Tagged to delete: ${taggedToDelete.map(v => v.name).join(', ')}`);
      }

      // 3) собираем digest’ы для каждого тега
      const digestMap = new Map(); // tag-name → Set<digest>
      for (const v of taggedToDelete) {
        const digs = new Set();
        for (const tag of v.metadata.container.tags) {
          try {
            const ds = await wrapper.getManifestDigests(owner, pkg.name, tag, isOrganization);
            if (Array.isArray(ds)) ds.forEach(d => digs.add(d));
            else if (ds) digs.add(ds);
          } catch (e) {
            debug && core.warning(`Failed to inspect manifest ${pkg.name}:${tag} — ${e.message}`);
          }
        }
        digestMap.set(v.name, digs);
      }

      // 4) слои без тегов, которые входят в любой из этих сетов
      const orphanLayers = withoutExclude.filter(v =>
        v.metadata.container.tags.length === 0 &&
        Array.from(digestMap.values()).some(digs => digs.has(v.name))
      );

      if (debug) {
        core.info(`Package ${pkg.name}: Orphan layers to delete: ${orphanLayers.map(v => v.name).join(', ')}`);
      }

      // 5) упорядочиваем: сначала каждый tagged-образ и его слои
      const ordered = [];
      const used = new Set();
      for (const v of taggedToDelete) {
        ordered.push(v);
        const digs = digestMap.get(v.name) || new Set();
        for (const layer of orphanLayers) {
          if (!used.has(layer.name) && digs.has(layer.name)) {
            ordered.push(layer);
            used.add(layer.name);
          }
        }
      }

      // 6) **dangling** — версии без тегов и не попавшие в `orphanLayers`
      const danglingLayers = pkg.versions.filter(v =>
        v.metadata.container.tags.length === 0 &&
        !Array.from(digestMap.values()).some(digs => digs.has(v.name)) &&
        !ordered.some(o => o.name === v.name)
      );

      if (debug && danglingLayers.length) {
        core.info(`Package ${pkg.name}: Dangling layers: ${danglingLayers.map(v => v.name).join(', ')}`);
      }

      // финальный список на удаление
      const toDelete = [...ordered, ...danglingLayers];

      if (toDelete.length > 0) {
        result.push({
          package: {
            id: pkg.id,
            name: pkg.name,
            type: pkg.packageType
          },
          versions: toDelete
        });
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
