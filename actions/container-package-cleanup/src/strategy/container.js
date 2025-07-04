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

        const result = [];

        for (const { package: pkg, versions } of packagesWithVersions) {
            if (!Array.isArray(versions)) {
                core.warning(`Package ${pkg.name} has no versions array`);
                continue;
            }

            // 1) отфильтровываем по дате и excludedPatterns
            const withoutExclude = versions.filter(v => {
                if (!Array.isArray(v.metadata?.container?.tags)) return false;
                if (new Date(v.created_at) > thresholdDate) return false;
                const tags = v.metadata.container.tags;
                return !excluded.some(pattern =>
                    tags.some(tag => this.wildcardMatcher.match(tag, pattern))
                );
            });

            // 2) из оставшихся берём tagged-версии по includedPatterns (или все, если included пуст)
            const taggedToDelete = included.length > 0
                ? withoutExclude.filter(v =>
                    v.metadata.container.tags.some(tag =>
                        included.some(pattern => this.wildcardMatcher.match(tag, pattern))
                    )
                )
                : withoutExclude.filter(v => v.metadata.container.tags.length > 0);

            // 3) собираем все digest’ы из manifest-list taggedToDelete
            const allDigests = new Set();
            for (const v of taggedToDelete) {
                for (const tag of v.metadata.container.tags) {
                    try {
                        const digests = await wrapper.getManifestDigests(owner, pkg.name, tag, isOrganization);
                        digests.forEach(d => allDigests.add(d));
                    } catch (e) {
                        debug && core.debug(`Failed to inspect manifest ${pkg.name}:${tag} — ${e.message}`);
                    }
                }
            }

            debug && core.info(`Digests for ${pkg.name}: ${[...allDigests].join(', ')}`);

            // 4) добавляем «сырые» версии без тегов, если их sha256 попал в allDigests
            const layersToDelete = withoutExclude.filter(v =>
                v.metadata.container.tags.length === 0 &&
                allDigests.has(v.name)
            );

            // 5) если есть что удалять — пушим в result
            const toDeleteVersions = [...taggedToDelete, ...layersToDelete];
            if (toDeleteVersions.length > 0) {
                result.push({
                    package: {
                        id: pkg.id,
                        name: pkg.name,
                        type: pkg.package_type
                    },
                    versions: toDeleteVersions
                });

                debug && core.info(`Versions to delete for package ${pkg.name}: ${JSON.stringify(
                    toDeleteVersions.map(v => v.id),
                    null,
                    2
                )}`);
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