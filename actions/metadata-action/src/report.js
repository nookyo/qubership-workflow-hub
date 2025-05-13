const core = require("@actions/core");
class Report {
    async writeSummary(template, distTag, extraTags, renderResult, dryRun = false) {

        // Calculate summary statistics.
        core.info("Calculate summary statistics.");
        const dryRunText = dryRun ? "(Dry Run)" : "";

        core.summary.addRaw(`### 🧪 Metadata in use ${dryRunText}:\n\n`);
        core.summary.addRaw(`**Template:** ${template}
                             **Dist tag:** ${distTag}
                             **Extra tags:** ${extraTags}
                             **Render result:** ${renderResult}\n\n`);

        core.summary.addRaw(`---\n\n`);
        core.summary.addRaw(`\n\n✅ Metadata extract completed successfully.`);

        await core.summary.write();
    }
}

module.exports = Report;