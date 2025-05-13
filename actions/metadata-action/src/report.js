const core = require("@actions/core");

class Report {
    async writeSummary(reportItem, dryRun = false) {
        core.info("Calculate summary statistics.");
        const dryRunText = dryRun ? " (Dry Run)" : "";

        core.summary.addRaw(`### 🧪 Metadata in use${dryRunText}:\n\n`);

        // Массив пар [label, value]
        const fields = [
            ["Ref",            reportItem.ref],
            ["SHA",            reportItem.sha],
            ["Timestamp",      reportItem.timestamp],
            ["Distribution tag", reportItem.distTag],
            ["Extra tags",     reportItem.extraTags],
            ["Template",       reportItem.template],
            ["Render result",  reportItem.renderResult],
        ];

        // Фильтруем пустые значения и превращаем в нужный формат
        const rows = fields
            .filter(([_, value]) => value != null && value !== "")
            .map(([label, value]) => [
                { data: label },
                { data: String(value) }
            ]);

        if (rows.length) {
            core.summary.addTable(rows);
        } else {
            core.summary.addRaw("Нет данных для отображения.\n");
        }

        core.summary.addRaw(`\n\n---\n\n✅ Metadata extract completed successfully.`);
        await core.summary.write();
    }
}

module.exports = Report;