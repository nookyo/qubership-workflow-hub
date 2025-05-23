class MavenStrategy {
    constructor() {
        this.name = 'MavenStrategy';
    }

    async execute(packagesWithVersions, excludedTags, includedTags, thresholdDate) {
        let filteredPackagesWithVersionsForDelete = packagesWithVersions;
        
     packagesWithVersions.array.forEach(element => {
        console.warn(`Achtung: ${JSON.stringify(element, null, 2)}`);
     });

     return filteredPackagesWithVersionsForDelete;
    }
}

module.exports = MavenStrategy;