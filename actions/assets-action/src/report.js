
async function showReport(reportSummary) {

    const { owner, repo, releaseTag, items } = reportSummary;

    console.info(`\n\n📊 Report Summary:`);
    console.info(`Owner: ${owner}`);
    console.info(`Repo: ${repo}`);
    console.info(`Release Tag: ${releaseTag}`);
    console.info(`Uploaded Items:`);

    if (items.length === 0) {
        console.info("No items uploaded.");
        return;
    }

    items.forEach((item, index) => {
        console.info(`${index + 1}. File Name: ${item.fileName}, Item Path: ${item.itemPath}`);
    });

    console.info(`\n✅ Report completed successfully.`);

}


exports.showReport = showReport;
