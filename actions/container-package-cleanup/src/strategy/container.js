const WildcardMatcher = require("./wildcardMatcher");

class ContainerStrategy {
    constructor() {
        this.name = 'ContainerStrategy';
    }

    async execute({ packagesWithVersions, excludedTags, includedTags, thresholdDate }) {

        const wildcardMatcher = new WildcardMatcher();

        let filteredPackagesWithVersionsForDelete = packagesWithVersions.map(({ package: pkg, versions }) => {

            const verisonWithOutExclude = versions.filter((version) => {
                const createdAt = new Date(version.created_at);
                const isOldEnough = createdAt <= thresholdDate;

                if (!isOldEnough) return false;
                if (!version.metadata || !version.metadata.container || !Array.isArray(version.metadata.container.tags)) return false;
                const tags = version.metadata.container.tags;

                if (excludedTags.length > 0 && tags.some(tag => excludedTags.some(pattern => wildcardMatcher.match(tag, pattern)))) {
                    return false;
                }
                return true;
            });

            const versionsToDelete = includedTags.length > 0 ? verisonWithOutExclude.filter((version) => {
                if (!version.metadata || !version.metadata.container || !Array.isArray(version.metadata.container.tags)) return false;
                const tags = version.metadata.container.tags;
                return tags.some(tag => includedTags.some(pattern => wildcardMatcher.match(tag, pattern)));
            }) : verisonWithOutExclude;

            const customPackage = {
                id: pkg.id,
                name: pkg.name,
                type: pkg.package_type
            };

            return { package: customPackage, versions: versionsToDelete };

        }).filter(item => item !== null && item.versions.length > 0);

        return filteredPackagesWithVersionsForDelete;
    }

    async toString() {
        return this.name;
    }
}

module.exports = ContainerStrategy;