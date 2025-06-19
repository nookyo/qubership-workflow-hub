const core = require("@actions/core");

class MavenReport {
  /**
   * @param {Array<{package: {id, name, type}, versions: Array<{name, created_at}>}>} filteredPackagesWithVersionsForDelete
   * @param {boolean} dryRun
   * @param {number} thresholdDays    // количество дней «старше» которых версии удаляются
   * @param {Date} thresholdDate      // пороговая дата — всё что создано до неё удаляется
   * @param {string[]} includedTags   // паттерны для поиска по имени версии
   */

  async writeSummary(context) {
    const {
      filteredPackagesWithVersionsForDelete,
      dryRun,
      thresholdDays,
      thresholdDate,
      includedTags,
      excludedTags,
    } = context;

    if (
      !filteredPackagesWithVersionsForDelete ||
      filteredPackagesWithVersionsForDelete.length === 0
    ) {
      core.info("❗️No packages or versions to delete.");
      return;
    }

    const dryRunText = dryRun ? "(Dry Run)" : "";
    const totalPackages = filteredPackagesWithVersionsForDelete.length;
    const totalDeletedVersions = filteredPackagesWithVersionsForDelete.reduce(
      (sum, item) => sum + item.versions.length,
      0,
    );

    const tableData = [
      [
        { data: "Package", header: true },
        { data: "Version", header: true },
        { data: "Created At", header: true },
      ],
    ];

    filteredPackagesWithVersionsForDelete.forEach(
      ({ package: pkg, versions }) => {
        versions.forEach((version) => {
          const pkgInfo = `<strong>${pkg.name}</strong><br/>(ID: ${pkg.id})`;
          const versionInfo = `<code>${version.name}</code>`;
          const createdAt = new Date(version.created_at).toISOString();
          tableData.push([pkgInfo, versionInfo, createdAt]);
        });
      },
    );

    core.summary.addRaw(
      `## 🎯 Container Package Cleanup Summary ${dryRunText}\n\n` +
        `**Threshold:** versions older than **${thresholdDays} days** ` +
        `(created before **${thresholdDate.toISOString().slice(0, 10)}**)\n\n` +
        `**Total Packages Processed:** ${totalPackages}  \n` +
        `**Total Deleted Versions:** ${totalDeletedVersions}\n\n` +
        `---\n\n`,
    );
    core.summary.addTable(tableData);
    core.summary.addRaw(`\n\n✅ Cleanup operation completed successfully.`);

    await core.summary.write();
  }
}

module.exports = MavenReport;
