const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { addToArchive } = require("./archiveUtils");
const AssetUploader = require("./assetsUploader");
const { retryAsync } = require("./retry");
const path = require("path");

async function getInput() {
  return {
    releaseTag: core.getInput("tag", { required: true }),
    archiveType: core.getInput("archive-type").trim() || "zip",
    itemPath: core.getInput("item-path").trim(),
    retries: parseInt(core.getInput("retries"), 10) || 3,
    delay: parseInt(core.getInput("retry-delay-ms"), 10) || 1000,
    factor: parseFloat(core.getInput("factor")) || 1
  };
}


async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const input = await getInput();
    const { owner, repo } = github.context.repo;

    if (!owner || !repo) {
      throw new Error(`❗️ Cant get owner/repo from github.context.repository`)
    }

    const itemsPath = typeof input.itemPath === "string" ? input.itemPath.split(",").map((p) => p.trim()).filter(Boolean) : [];

    if (itemsPath.length === 0) {
      throw new Error("❗️ No valid file or folder paths provided.");
    }

    const assetsUploader = new AssetUploader(token, input.releaseTag, owner, repo);
    if (!assetsUploader) {
      throw new Error(`❗️ Failed to initialize AssetUploader`);
    }

    core.info(`Using archive type: ${input.archiveType}`);
    core.info(await assetsUploader.toString());
    core.info(`Items: ${itemsPath}`);

    for (const itemPath of itemsPath) {

      if (!fs.existsSync(itemPath)) {
        core.info(`⚠️ File or folder not found: ${itemPath}`);
        continue;
      }

      core.info(`Processing item: ${itemPath}`);

      let archivePath = itemPath;
      if (fs.statSync(itemPath).isDirectory()) {
        archivePath = await addToArchive(itemPath, input.archiveType);
      }

      await retryAsync(async () => Promise.resolve(assetsUploader.upload(archivePath)), {
        retries: input.retries,
        delay: input.delay,
        factor: input.factor
      })
        // .then(() => core.info(`Asset uploaded successfully: ${archivePath}`))
        // .catch((error) => core.setFailed(`❗️ Failed to upload asset: ${error.message}`));
    }

    core.info('✅ Action completed successfully!');
  } catch (error) {
    core.setFailed(`❌ Error: ${error.message}`);
  }
}

run();
