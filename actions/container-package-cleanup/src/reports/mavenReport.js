const core = require("@actions/core");

class MavenReport {
    async writeSummary(filteredPackagesWithVersionsForDelete, dryRun = false) {
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

        core.summary.addRaw(`## 🎯 Maven Package Cleanup Summary ${dryRunText}\n\n`);
        core.summary.addRaw(`**Total Packages Processed:** ${totalPackages}  \n`);
        core.summary.addRaw(`**Total Deleted Versions:** ${totalDeletedVersions}\n\n`);
        core.summary.addRaw(`---\n\n`);
        core.summary.addTable(tableData);
        core.summary.addRaw(`\n\n✅ Cleanup operation completed successfully.`);

        await core.summary.write();
    }
}

module.exports = MavenReport;
