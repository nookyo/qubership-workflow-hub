const core = require("@actions/core");

class Report {
    async writeSummary(items, owner, repo, releaseTag, dryRun = false) {
        if (!items || items.length === 0) {
            core.info("❗️No assets uploaded, ничего записывать не нужно.");
            return;
        }

        const dryRunText = dryRun ? "(Dry Run)" : "";
        const totalItems = items.length;

        const tableData = [
            [
                { data: "File Name", header: true },
                { data: "Archive Path", header: true },
                { data: "Status", header: true }
            ]
        ];

        items.forEach(({ fileName, itemPath }) => {
            tableData.push([
                fileName,
                itemPath
            ]);
        });

        core.summary.addRaw(`## 🧪 Asset Uploader Summary ${dryRunText}\n\n`);
        core.summary.addRaw(`**Repository:** ${owner}/${repo}  \n`);
        core.summary.addRaw(`**Release Tag:** \`${releaseTag}\`  \n`);
        core.summary.addRaw(`**Total Assets Uploaded:** ${totalItems}\n\n`);
        core.summary.addRaw(`---\n\n`);

        core.summary.addTable(tableData);

        await core.summary.write();
    }
}

module.exports = Report;
