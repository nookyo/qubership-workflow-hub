const core = require("@actions/core");
class Report {
    async writeSummary(reportItem, dryRun = false) {
        core.info("Calculate summary statistics.");
        const dryRunText = dryRun ? " (Dry Run)" : "";

        // Header
        core.summary.addRaw(`### 🧪 Metadata in use ${dryRunText}:\n\n`);

        // Table
        core.summary.addTable([
            [{ data: "Ref" }, { data: reportItem.ref }],
            [{ data: "SHA" }, { data: reportItem.sha }],
            [{ data: "Timestamp" }, { data: reportItem.timestamp }],
            [{ data: "Template" }, { data: reportItem.template }],
            [{ data: "Distribution tag" }, { data: reportItem.distTag }],
            [{ data: "Extra tags" }, { data: reportItem.extraTags }],
            [{ data: "Render result" }, { data: reportItem.renderResult }],
        ]);

        core.summary.addRaw(`\n\n---\n\n✅ Metadata extract completed successfully.`);
        await core.summary.write();
    }
}

module.exports = Report;