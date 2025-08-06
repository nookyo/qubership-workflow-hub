const core = require("@actions/core");

async function deletePackageVersion(filteredPackagesWithVersionsForDelete) {

    for (const { package: pkg, versions } of filteredPackagesWithVersionsForDelete) {
        for (const version of versions) {
            try {
                let detail = pkg.type === 'maven' ? version.name : (version.metadata?.container?.tags ?? []).join(', ');
                core.info(`Package: ${pkg.name} (${pkg.type}) — deleting version: ${version.id} (${detail})`);
                // await wrapper.deletePackageVersion(owner, pkg.type, pkg.name, version.id, isOrganization);

            } catch (error) {
                // Handle specific error for high download count
                if (error.message.includes("Publicly visible package versions with more than 5000 downloads cannot be deleted")) {
                    core.warning(`Skipping version: ${version.id} (${version.metadata?.container?.tags?.join(', ')}) due to high download count.`);
                } else {
                    core.error(`Failed to delete version: ${version.id} (${version.metadata?.container?.tags?.join(', ')}) — ${error.message}`);
                }
            }
        }
    }

}

module.exports = { deletePackageVersion };