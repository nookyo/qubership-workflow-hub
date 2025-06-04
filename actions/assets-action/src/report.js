const core = require("@actions/core");

class Report {

    async writeSummary(items, owner, repo, releaseTag) {

        if (!Array.isArray(items) || items.length === 0) {
            core.info("❗️No assets processed — нечего добавлять в сводку.");
            return;
        }

        core.summary.addRaw(`## 📊 Report Summary\n\n`);
        core.summary.addRaw(`**Owner:** ${owner}  \n`);
        core.summary.addRaw(`**Repo:** ${repo}  \n`);
        core.summary.addRaw(`**Release Tag:** \`${releaseTag}\`  \n\n`);
        core.summary.addRaw(`---\n\n`);

        const tableData = [
            [
                { data: "File Name", header: true },
                { data: "Item Path", header: true },
                { data: "Status", header: true }
            ]
        ];

        items.forEach(({ fileName, itemPath, success, error }) => {
            const displayName = fileName || "-";
            switch (success) {
                case "Success":
                    core.info(`✔️ Successfully uploaded: ${displayName}`);
                    break;
                case "Failed":
                    core.error(`❌ Failed to upload: ${displayName}. Error: ${error || "unknown error"}`);
                    break;
                case "NotFound":
                    core.warning(`⚠️ File or folder not found: ${displayName}`);
                default:
                    core.warning(`⚠️ Status unknown for: ${displayName}`);
            }
            const statusCell = success
                ? "✅ Uploaded"
                : `❌ Failed: ${error || "unknown error"}`;

            tableData.push([displayName, itemPath, statusCell]);
        });

        core.summary.addTable(tableData);
        await core.summary.write();
    }
}

module.exports = Report;
