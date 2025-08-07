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
      * @param {Object} params.wrapper
      * @param {string} params.owner
      * @param {boolean} [params.debug=false]
      * @returns {Promise<Array<{ package: Object, versions: Array }>>}
      */
    async execute({ packagesWithVersions, excludedPatterns = [], includedPatterns = [], thresholdDate, wrapper, owner, debug = false }) {
        core.info(`Executing ContainerStrategy on ${Array.isArray(packagesWithVersions) ? packagesWithVersions.length : 'unknown'} packages.`);

        const excluded = excludedPatterns.map(p => p.toLowerCase());
        const included = includedPatterns.map(p => p.toLowerCase());
        const packages = await this.parse(packagesWithVersions);
        const result = [];

        for (const pkg of packages) {
            // Защищённые теги: latest + те, что попали в excludedPatterns
            const protectedTags = new Set();
            for (const v of pkg.versions) {
                for (const tag of v.metadata.container.tags) {
                    const low = tag.toLowerCase();
                    if (low === 'latest' || excluded.some(pat => this.wildcardMatcher.match(low, pat))) {
                        protectedTags.add(tag);
                    }
                }
            }

            // Собираем digest'ы защищённых тегов
            const protectedDigests = new Set();
            for (const tag of protectedTags) {
                try {
                    const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
                    if (Array.isArray(ds)) ds.forEach(d => protectedDigests.add(d));
                    else if (ds) protectedDigests.add(ds);
                } catch (e) {
                    if (debug) core.warning(`Failed to fetch manifest for ${pkg.name}:${tag} — ${e.message}`);
                }
            }

            // 1) Базовая фильтрация по дате и excludedPatterns для tagged/orphan
            const withoutExclude = pkg.versions.filter(v => {
                if (new Date(v.createdAt) > thresholdDate) return false;
                const tags = v.metadata.container.tags.map(t => t.toLowerCase());
                if (tags.includes('latest')) return false;
                if (excluded.some(pat => tags.some(t => this.wildcardMatcher.match(t, pat)))) {
                    return false;
                }
                return true;
            });

            // 2) Отбираем tagged-версии по includePatterns
            const taggedToDelete = included.length > 0
                ? withoutExclude.filter(v =>
                    v.metadata.container.tags
                        .map(t => t.toLowerCase())
                        .some(t => included.some(pat => this.wildcardMatcher.match(t, pat)))
                )
                : withoutExclude.filter(v => v.metadata.container.tags.length > 0);

            if (debug) core.info(` [${pkg.name}] taggedToDelete: ${taggedToDelete.map(v => v.name).join(', ')}`);

            // 3) Собираем manifest-digests для каждого тегнутого
            const digestMap = new Map();
            for (const v of taggedToDelete) {
                const digs = new Set();
                for (const tag of v.metadata.container.tags) {
                    try {
                        const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
                        if (Array.isArray(ds)) ds.forEach(d => digs.add(d));
                        else if (ds) digs.add(ds);
                    } catch (e) {
                        if (debug) core.warning(`Failed to fetch manifest ${pkg.name}:${tag} — ${e.message}`);
                    }
                }
                digestMap.set(v.name, digs);
            }

            // 4) Arch layers: из withoutExclude
            const archLayers = withoutExclude.filter(v =>
                v.metadata.container.tags.length === 0 &&
                Array.from(digestMap.values()).some(digs => digs.has(v.name))
            );
            if (debug) core.info(` [${pkg.name}] archLayers: ${archLayers.map(v => v.name).join(', ')}`);

            // 5) Упорядочиваем tagged + их archLayers
            const ordered = [];
            const used = new Set();
            for (const v of taggedToDelete) {
                ordered.push(v);
                const digs = digestMap.get(v.name) || new Set();
                for (const layer of archLayers) {
                    if (!used.has(layer.name) && digs.has(layer.name)) {
                        ordered.push(layer);
                        used.add(layer.name);
                    }
                }
            }

            // 6) Dangling: только по дате, без тегов, не в ordered и не в protectedDigests
            const danglingLayers = pkg.versions.filter(v =>
                new Date(v.createdAt) <= thresholdDate &&
                v.metadata.container.tags.length === 0 &&
                !Array.from(digestMap.values()).some(digs => digs.has(v.name)) &&
                !protectedDigests.has(v.name) &&
                !ordered.some(o => o.name === v.name)
            );
            if (debug && danglingLayers.length) {
                core.info(` [${pkg.name}] danglingLayers: ${danglingLayers.map(v => v.name).join(', ')}`);
            }

            const toDelete = [...ordered, ...danglingLayers];
            if (toDelete.length > 0) {
                result.push({
                    package: { id: pkg.id, name: pkg.name, type: pkg.packageType },
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