// index.js
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { execSync } = require("child_process");
const { addToArchive } = require("./archiveUtils");
const AssetUploader = require("./assetsUploader");

async function getInput() {
  return {
    releaseTag: core.getInput("tag", { required: true }),
    archiveType: core.getInput("archive-type").trim() || "zip",
    itemPath: core.getInput("item-path").trim(),
  };
}

// async function addToAssets(itemPaths) {
//     const octokit = github.getOctokit(core.getInput('token', { required: true }));
//     const { owner, repo } = github.context.repo;

//     for (const itemPath of itemPaths) {
//         if (!fs.existsSync(itemPath)) {
//             throw new Error(`File or folder not found: ${itemPath}`);
//         }

//         const fileName = path.basename(itemPath);
//         const fileStream = fs.createReadStream(itemPath);

//         try {
//             const response = await octokit.rest.repos.uploadReleaseAsset({
//                 owner,
//                 repo,
//                 release_id: core.getInput('release-id'),
//                 name: fileName,
//                 data: fileStream
//             });

//             console.log(`Asset uploaded: ${response.data.browser_download_url}`);
//         } catch (error) {
//             throw new Error(`Failed to upload asset: ${error.message}`);
//         }
//     }

// }

async function addToAssets(itemPaths, token) {
  const octokit = github.getOctokit(token);
}


async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const input = await getInput();
    const { owner, repo } = github.context.repo;

    if (!owner || !repo) {
      throw new Error(`Cant get owner/repo from github.context.repository`)
    }

    const itemPaths = typeof input.itemPath === "string" ? input.itemPath.split(",").map((p) => p.trim()).filter(Boolean) : [];

    if (itemPaths.length === 0) {
      throw new Error("No valid file or folder paths provided.");
    }

    const assetsUploader = new AssetUploader(token, input.releaseTag, owner, repo);
    if (!assetsUploader) {
      throw new Error(`Failed to initialize AssetUploader`);
    }
    assetsUploader.init();

    core.info(`AssetsUploader initialized for ${owner}/${repo} with tag ${input.releaseTag}`);
    core.info(`Using archive type: ${input.archiveType}`);

    assetsUploader.toString();

    core.info(`Item paths: ${itemPaths}`);

    for (const itemPath of itemPaths) {
      if (!fs.existsSync(itemPath)) {
        core.info(`File or folder not found: ${itemPath}`);
        continue;
      }

      await addToArchive(itemPath, input.archiveType);

    }

    execSync(`ls -la`, { stdio: "inherit" });

  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
