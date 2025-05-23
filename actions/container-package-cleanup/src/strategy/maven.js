class MavenStrategy {
    constructor() {
        this.name = 'MavenStrategy';
    }

    async execute(packagesWithVersions, excludedTags, includedTags, thresholdDate) {
        let filteredPackagesWithVersionsForDelete = packagesWithVersions;
        
     packagesWithVersions.array.forEach(element => {
        console.log(element.name);
     });

     return filteredPackagesWithVersionsForDelete;
    }
}

module.exports = MavenStrategy;