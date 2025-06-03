// index.js
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { execSync } = require("child_process");
const { addToArchive, createDir } = require("./archiveUtils");

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

    // const octokit = github.getOctokit(token);
    // const release = await octokit.rest.repos.getReleaseByTag({
    //     owner,
    //     repo,
    //     tag: input.releaseTag
    // });

    // octokit.rest.repos.uploadReleaseAsset({
    //     owner,
    //     repo,
    //     release_id: release.data.id,
    //     name: 'example.txt', // Здесь нужно указать имя файла, который вы хотите загрузить
    //     data: fs.createReadStream('path/to/your/file.txt') // Здесь нужно указать путь к файлу
    // });

    const itemPaths =
      typeof input.itemPath === "string" ? input.itemPath.split(",").map((p) => p.trim()).filter(Boolean) : [];

    if (itemPaths.length === 0) {
      throw new Error("No valid file or folder paths provided.");
    }

    console.log(`Item paths: ${itemPaths}`);
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
