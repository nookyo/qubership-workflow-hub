const core = require("@actions/core");

/**
 * Контекст отчёта по удалению пакетов
 */
class ReportContext {
    /**
     * @param {Object} params
     * @param {Array<{package: {id, name, type}, versions: Array<{name, created_at}>}>} params.filteredPackagesWithVersionsForDelete
     * @param {boolean} [params.dryRun=false]
     * @param {number} params.thresholdDays
     * @param {Date} params.thresholdDate
     * @param {string[]} [params.includedTags=[]]
     * @param {string[]} [params.excludedTags=[]]
     */
    // constructor({
    //     filteredPackagesWithVersionsForDelete,
    //     dryRun = false,
    //     thresholdDays,
    //     thresholdDate,
    //     includedTags = [],
    //     excludedTags = []
    // }) {
    //     this.filteredPackagesWithVersionsForDelete = filteredPackagesWithVersionsForDelete;
    //     this.dryRun = dryRun;
    //     this.thresholdDays = thresholdDays;
    //     this.thresholdDate = thresholdDate;
    //     this.includedTags = includedTags;
    //     this.excludedTags = excludedTags;
    // }
}

class MavenReport {
    /**
     * @param {ReportContext} context
     */
    async writeSummary(context) {
        const {
            filteredPackagesWithVersionsForDelete,
            dryRun,
            thresholdDays,
            thresholdDate,
            includedTags,
            excludedTags
        } = context;

        if (!filteredPackagesWithVersionsForDelete || filteredPackagesWithVersionsForDelete.length === 0) {
            core.info("❗️No packages or versions to delete.");
            return;
        }

        const dryRunText = dryRun ? "(Dry Run)" : "";
        const totalPackages = filteredPackagesWithVersionsForDelete.length;
        const totalDeletedVersions = filteredPackagesWithVersionsForDelete
            .reduce((sum, item) => sum + item.versions.length, 0);

        // Header
        core.summary.addRaw(`## 🎯 Container Package Cleanup Summary ${dryRunText}\n\n`);
        core.summary.addRaw(`**Parameters:**\n\n`);
        core.summary.addRaw(`- Threshold Days: ${thresholdDays}\n`);
        core.summary.addRaw(`- Threshold Date: ${thresholdDate.toISOString().slice(0, 10)}\n`);

        core.summary.addRaw(
            `- Included Tags Patterns: ${includedTags.length
                ? includedTags.map(t => `<code>${t}</code>`).join(", ")
                : "None"
            }\n`
        );
        // core.summary.addRaw(
        //     `- Excluded Tags Patterns: ${excludedTags.length
        //         ? excludedTags.map(t => `<code>${t}</code>`).join(", ")
        //         : "None"
        //     }\n\n`
        // );
        core.summary.addRaw(`---\n\n`);

        // Body
        const tableData = [
            [
                { data: "Package", header: true },
                { data: "Version", header: true },
                { data: "Created At", header: true }
            ]
        ];

        filteredPackagesWithVersionsForDelete.forEach(({ package: pkg, versions }) => {
            versions.forEach(version => {
                tableData.push([
                    `<strong>${pkg.name}</strong><br/>(ID: ${pkg.id})`,
                    `<code>${version.name}</code>`,
                    new Date(version.created_at).toISOString()
                ]);
            });
        });

        core.summary.addTable(tableData);
        core.summary.addRaw(`\n\n✅ Cleanup operation completed successfully.`);
        await core.summary.write();
    }
}

module.exports = { MavenReport, ReportContext };