const core = require("@actions/core");

class MavenReport {

    /**
      * @param {Array<{package: {id, name, type}, versions: Array<{name, created_at}>}>} filteredPackagesWithVersionsForDelete
      * @param {boolean} dryRun
      * @param {number} thresholdDays    // Number of days before which versions are considered for deletion
      * @param {Date} thresholdDate      // Edge date for deletion, versions created before this date will be considered
      * @returns {Promise<void>}
      * @description Writes a summary of the packages and versions that are eligible for deletion.
      * The summary includes package names, version names, creation dates, and the total count of packages and versions.
      * If dryRun is true, it indicates that no actual deletions will occur.
      */

    async writeSummary(filteredPackagesWithVersionsForDelete, thresholdDays, thresholdDate, dryRun = false) {
        if (!filteredPackagesWithVersionsForDelete || filteredPackagesWithVersionsForDelete.length === 0) {
            core.info("❗️No packages or versions to delete.");
            return;
        }

        const dryRunText = dryRun ? "(Dry Run)" : "";
        const totalPackages = filteredPackagesWithVersionsForDelete.length;
        const totalDeletedVersions = filteredPackagesWithVersionsForDelete.reduce((sum, item) => sum + item.versions.length, 0);


        const tableData = [
            [
                { data: "Package", header: true },
                { data: "Version", header: true },
                { data: "Created At", header: true }
            ]
        ];

        filteredPackagesWithVersionsForDelete.forEach(({ package: pkg, versions }) => {
            versions.forEach(version => {
                const pkgInfo = `<strong>${pkg.name}</strong><br/>(ID: ${pkg.id})`;
                const versionInfo = `<code>${version.name}</code>`;
                const createdAt = new Date(version.created_at).toISOString();
                tableData.push([pkgInfo, versionInfo, createdAt]);
            });
        });

        core.summary.addRaw(
            `## 🎯 Container Package Cleanup Summary ${dryRunText}\n\n` +
            `**Threshold:** versions older than **${thresholdDays} days** ` +
            `(created before **${thresholdDate.toISOString().slice(0, 10)}**)\n\n` +
            `**Total Packages Processed:** ${totalPackages}  \n` +
            `**Total Deleted Versions:** ${totalDeletedVersions}\n\n` +
            `---\n\n`
        );
        core.summary.addTable(tableData);
        core.summary.addRaw(`\n\n✅ Cleanup operation completed successfully.`);

        await core.summary.write();
    }
}

module.exports = MavenReport;
