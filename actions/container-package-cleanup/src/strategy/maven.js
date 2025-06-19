const core = require('@actions/core');
const WildcardMatcher = require("./wildcardMatcher");


class MavenStrategy {
    constructor() {
        this.name = 'ManevStrategy';
    }

    async execute({ packagesWithVersions, excludedTags, includedTags, thresholdDate, debug = true }) {

        const wildcardMatcher = new WildcardMatcher();

        let filteredPackagesWithVersionsForDelete = packagesWithVersions.map(({ package: pkg, versions }) => {

            let versionForDelete = versions.filter((version) => {
                const createdAt = new Date(version.created_at);
                const isOldEnough = createdAt <= thresholdDate;

                if (debug) {
                    console.log(`Version created at: ${createdAt}, Threshold date: ${thresholdDate}, Is old enough: ${isOldEnough}`);
                }


                if (!isOldEnough) return false;
                return wildcardMatcher.match(version.name, '*SNAPSHOT*');
            });

            let customPackage = {
                id: pkg.id,
                name: pkg.name,
                type: pkg.package_type,
                versions: pkg.versions
            };

            return { package: customPackage, versions: versionForDelete };
        });

        core.info(`Filtered packages with Maven type: ${JSON.stringify(filteredPackagesWithVersionsForDelete, null, 2)}`);


        // let filteredPackagesWithVersionsForDelete = packagesWithVersions.map(({ package: pkg, versions }) => {

        //     const verisonWithOutExclude = versions.filter((version) => {
        //         const createdAt = new Date(version.created_at);
        //         const isOldEnough = createdAt <= thresholdDate;

        //         if (!isOldEnough) return false;
        //         if (!version.metadata || !version.metadata.container || !Array.isArray(version.metadata.container.tags)) return false;
        //         const tags = version.metadata.container.tags;

        //         if (excludedTags.length > 0 && tags.some(tag => excludedTags.some(pattern => wildcardMatch(tag, pattern)))) {
        //             return false;
        //         }
        //         return true;
        //     });

        //     const versionsToDelete = includedTags.length > 0 ? verisonWithOutExclude.filter((version) => {
        //         if (!version.metadata || !version.metadata.container || !Array.isArray(version.metadata.container.tags)) return false;
        //         const tags = version.metadata.container.tags;
        //         return tags.some(tag => includedTags.some(pattern => wildcardMatch(tag, pattern)));
        //     }) : verisonWithOutExclude;

        //     const customPackage = {
        //         id: pkg.id,
        //         name: pkg.name,
        //         type: pkg.package_type
        //     };

        //     return { package: customPackage, versions: versionsToDelete };

        // }).filter(item => item !== null && item.versions.length > 0);

        return filteredPackagesWithVersionsForDelete;
    }

    async toString() {
        return this.name;
    }
}

module.exports = MavenStrategy;