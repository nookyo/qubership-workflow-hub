const core = require("@actions/core");
class Report {
    async writeSummary(template, distTag, dryRun = false) {

        // Calculate summary statistics.
        const dryRunText = dryRun ? "(Dry Run)" : "";

        core.summary.addRaw(`## 🔻 Metadata in use: ${dryRunText}\n\n`);
        core.summary.addRaw(`**Template:** ${template}
                             **Distribution Tag:** ${distTag}\n\n`);
        core.summary.addRaw(`---\n\n`);
        core.summary.addRaw(`\n\n✅ Metadata extract completed successfully.`);

        await core.summary.write();
    }
}

module.exports = Report;