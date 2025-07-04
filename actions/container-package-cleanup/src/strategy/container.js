const core = require('@actions/core');
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
    constructor() {
        super();
        this.name = 'Container Strategy';
        this.wildcardMatcher = new WildcardMatcher();
    }

    async execute({ packagesWithVersions, excludedPatterns, includedPatterns, thresholdDate, wrapper, owner, isOrganization, debug = false }) {

        const excluded = excludedPatterns.map(p => p.toLowerCase());
        const included = includedPatterns.map(p => p.toLowerCase());

        let toDelete = [];
        //debug && core.info(`Package with versions: ${JSON.stringify(packagesWithVersions, null, 2)}`);
        const filteredPackagesWithVersionsForDelete = packagesWithVersions;
        for (let { package: pkg, versions } of packagesWithVersions) {

            //debug && core.info(`Processing versions for package: ${JSON.stringify(versions, null, 2)}`);
            if (!Array.isArray(versions)) {
                core.warning(`Package ${pkg.name} does not have valid versions array.`);
                continue;
            }

            const candidates = versions.filter(v => {
                if (!this.isValidMetadata(v)) return false;

                const createdAt = new Date(v.created_at);
                if (createdAt > thresholdDate) return false;

                const tags = v.metadata.container.tags || [];
                if (excluded.length > 0 && tags.some(tag => excluded.some(pattern => this.wildcardMatcher.match(tag, pattern)))) {
                    return false;
                }
                return true;
            });

            const taggedToDelete = included.length > 0 ? candidates.filter(v => {
                const tags = v.metadata.container.tags || [];
                included.some(pattern => {
                    return tags.some(tag => this.wildcardMatcher.match(tag, pattern));
                });
            }) : candidates;

            //debug && core.info(`Filtered candidates for package ${pkg.name}: ${JSON.stringify(taggedCandidates, null, 2)}`);

            const allDigests = new Set();
            for (const v of taggedToDelete) {
                for (const tag of v.metadata.container.tags) {
                    try {
                        const digests = await wrapper.getManifestDigests(
                            owner,
                            pkg.name,
                            tag,
                            isOrganization
                        );
                        digests.forEach(d => allDigests.add(d));
                    } catch (e) {
                        debug && core.debug(`Cannot get manifest digests for package ${pkg.name} with tag ${tag}: ${e.message}`);
                    }
                }
            }

            debug && core.info(`All digests for package ${pkg.name}: ${Array.from(allDigests).join(', ')}`);

            const layersToDelete = candidates.filter(v => (v.metadata.container.tags || []).length === 0 && allDigests.has(v.name));

            for (const v of [...taggedToDelete, ...layersToDelete]) {
                toDelete.push({
                    package: {
                        id: pkg.id,
                        name: pkg.name,
                        type: pkg.package_type
                    },
                    version: {
                        id: v.id,
                        name: v.name,
                        metadata: v.metadata
                    }
                });
            }

            debug && core.info(`Versions to delete for package ${pkg.name}: ${JSON.stringify(toDelete, null, 2)}`);

        }
        // const candidates = packagesWithVersions.filter(v => {
        //     if (!Array.isArray(v.metadata?.container?.tags)) return false;
        //     const createdAt = new Date(v.created_at);

        //     if (createdAt > thresholdDate) return false;

        //     const tags = v.metadata.container.tags || [];
        //     if (excluded.length > 0 && tags.some(tag => excluded.some(pattern => this.wildcardMatcher.match(tag, pattern)))) {
        //     return false;
        //     }
        //     return true;

        // });

        // let filteredPackagesWithVersionsForDelete = packagesWithVersions.map(({ package: pkg, versions }) => {

        //     const versionsWithoutExclude = versions.filter((version) => {

        //         if (!this.isValidMetadata(version)) return false;

        //         const createdAt = new Date(version.created_at);
        //         const isOldEnough = createdAt <= thresholdDate;

        //         debug && core.debug(`Checking package: ${pkg.name} version: ${version.name}, created at: ${createdAt}, Threshold date: ${thresholdDate}, Is old enough: ${isOldEnough}`);

        //         if (!isOldEnough) return false;

        //         const tags = version.metadata.container.tags || [];

        //         if (excludePatterns.length > 0 && tags.some(tag => excludePatterns.some(pattern => this.wildcardMatcher.match(tag, pattern)))) {
        //             return false;
        //         }
        //         return true;
        //     });

        //     const versionsToDelete = includePatterns.length > 0 ? versionsWithoutExclude.filter((version) => {
        //         const tags = version.metadata.container.tags;

        //         if (tags.length === 0 && version.name.startsWith('sha256:')) return true;

        //         return tags.some(tag => includePatterns.some(pattern => this.wildcardMatcher.match(tag, pattern)));
        //     }) : versionsWithoutExclude;

        //     const customPackage = {
        //         id: pkg.id,
        //         name: pkg.name,
        //         type: pkg.package_type
        //     };

        //     return { package: customPackage, versions: versionsToDelete };

        // }).filter(item => item !== null && item.versions.length > 0);

        return toDelete;
    }

    isValidMetadata(version) {
        return Array.isArray(version?.metadata?.container?.tags);
    }

    toString() {
        return this.name;
    }
}

module.exports = ContainerStrategy;