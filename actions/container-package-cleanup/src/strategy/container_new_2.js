const core = require('@actions/core');
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
    constructor() {
        super();
        this.name = 'Container Strategy';
        this.wildcardMatcher = new WildcardMatcher();
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
    async execute({ packagesWithVersions, excludedPatterns, includedPatterns, thresholdDate, wrapper, owner, isOrganization, debug = false }) {
        const excluded = excludedPatterns.map(p => p.toLowerCase());
        const included = includedPatterns.map(p => p.toLowerCase());
        const result = [];
        result = packagesWithVersions;

        core.info(`Executing ContainerStrategy with ${packagesWithVersions.length} packages.`);

        // for (const { package: pkg, versions } of packagesWithVersions) {
        //     if (!Array.isArray(versions)) {
        //         core.warning(`Package ${pkg.name} has no versions array`);
        //         continue;
        //     }

        //     // 1) Filter by date and excludedPatterns
        //     const withoutExclude = versions.filter(v => {
        //         if (!Array.isArray(v.metadata?.container?.tags)) return false;
        //         if (new Date(v.created_at) > thresholdDate) return false;
        //         const tags = v.metadata.container.tags;
        //         return !excluded.some(pattern => tags.some(tag => this.wildcardMatcher.match(tag, pattern)));
        //     });

        //     // 2) Pick tagged versions for deletion based on includedPatterns (or all if none provided)
        //     const taggedToDelete = included.length > 0
        //         ? withoutExclude.filter(v =>
        //             v.metadata.container.tags.some(tag => included.some(pattern => this.wildcardMatcher.match(tag, pattern))))
        //         : withoutExclude.filter(v => v.metadata.container.tags.length > 0);

        //     if (taggedToDelete.length === 0) {
        //         debug && core.info(`No tagged versions to delete for ${pkg.name}`);
        //         continue;
        //     }

        //     // 3) Collect manifest digests for each tagged version
        //     //    Map: version.id -> Set(digests)
        //     const digestMap = new Map();
        //     for (const v of taggedToDelete) {
        //         const digs = new Set();
        //         for (const tag of v.metadata.container.tags) {
        //             try {
        //                 const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
        //                 ds.forEach(d => digs.add(d));
        //             } catch (e) {
        //                 debug && core.debug(`Failed to inspect manifest ${pkg.name}:${tag} — ${e.message}`);
        //             }
        //         }
        //         digestMap.set(v.id, digs);
        //     }

        //     // 4) Find all untagged layer versions whose digest is in any digestMap
        //     const layersToDelete = withoutExclude.filter(v =>
        //         v.metadata.container.tags.length === 0 &&
        //         Array.from(digestMap.values()).some(digs => digs.has(v.name))
        //     );

        //     // 5) Build ordered list: tagged version, its layers, next tagged, its layers...
        //     const ordered = [];
        //     const usedLayerIds = new Set();

        //     for (const v of taggedToDelete) {
        //         ordered.push(v);
        //         const digs = digestMap.get(v.id) || new Set();
        //         for (const layer of layersToDelete) {
        //             if (!usedLayerIds.has(layer.id) && digs.has(layer.name)) {
        //                 ordered.push(layer);
        //                 usedLayerIds.add(layer.id);
        //             }
        //         }
        //     }

        //     // 6) Append to result if anything to delete
        //     if (ordered.length > 0) {
        //         result.push({
        //             package: {
        //                 id: pkg.id,
        //                 name: pkg.name,
        //                 type: pkg.package_type
        //             },
        //             versions: ordered
        //         });
        //         debug && core.info(`Versions to delete for package ${pkg.name}: ${ordered.map(v => v.id + ' (' + (v.metadata?.container?.tags||[]).join(', ') + ')').join(', ')}`);
        //     }
        // }

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
