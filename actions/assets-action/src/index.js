// index.js
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver"); // для ZIP
const { execSync } = require("child_process");

async function getInput() {
  return {
    releaseTag: core.getInput("tag", { required: true }),
    // filePath: core.getInput('file-path').trim(),
    // folderPath: core.getInput('folder-path').trim(),
    // archiveFlag: core.getInput('archive') === 'true',
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

// if (fs.statSync(itemPaths).isDirectory()) {

//     const archiveName = `${path.basename(itemPaths)}.${archiveType}`;
//     const archivePath = path.join(path.dirname(itemPaths), archiveName);
//     const output = fs.createWriteStream(archivePath);
//     const archive = archiver(archiveType, { zlib: { level: 9 } });

//     output.on('close', async () => {
//         console.log(`Archive created: ${archivePath}`);
//         await uploadAsset(archivePath, token);
//     });

//     archive.on('error', err => {
//         throw new Error(`Archive error: ${err.message}`);
//     });

//     archive.pipe(output);
//     archive.directory(itemPaths, false);
//     await archive.finalize();

// }
async function addToAssets(itemPaths, token) {
  const octokit = github.getOctokit(token);
}

async function addToArchive(itemPaths, archiveType) {

  if (fs.statSync(itemPaths).isDirectory()) {
    const archiveName = `${path.basename(itemPaths)}.${archiveType}`;
    const archivePath = path.join('dist/' + path.dirname(itemPaths), archiveName);
    const output = fs.createWriteStream(archivePath);
    const archive = archiver(archiveType, { zlib: { level: 9 } });

    output.on("close", async () => {
      console.log(`Archive created: ${archivePath}`);
    });

    archive.on("error", (err) => {
      throw new Error(`Archive error: ${err.message}`);
    });

    archive.pipe(output);
    archive.directory(itemPaths, false);
    await archive.finalize();

    // await uploadAsset(archivePath, token);
  }
}

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const input = await getInput();

    // if ((filePath && folderPath) || (!filePath && !folderPath)) {
    //     throw new Error('Please provide either file-path or folder-path, not both.');
    // }

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

    // const filePaths = input.filePath.split(',').map(p => p.trim()).filter(Boolean);
    // const folderPaths = input.folderPath.split(',').map(p => p.trim()).filter(Boolean);

    // const iterableItems = filePaths.length > 0 ? filePaths : folderPaths;
    // if (iterableItems.length === 0) {
    //     throw new Error('No valid file or folder paths provided.');
    // }

    const itemPaths =
      typeof input.itemPath === "string"
        ? input.itemPath
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

    if (itemPaths.length === 0) {
      throw new Error("No valid file or folder paths provided.");
    }
    console.log(`Item paths: ${itemPaths}`);
    for (const itemPath of itemPaths) {
      if (!fs.existsSync(itemPath)) {
        core.info(`File or folder not found: ${itemPath}`);
        continue; // Пропускаем, если файл или папка не найдены
      }

      await addToArchive(itemPath, input.archiveType);

      //await addToAssets(itemPath);
    }

    execSync(`ls -la`, { stdio: "inherit" });

    // for (const itemPath of itemPaths) {
    //     if (input.archiveFlag) {
    //         const archiveName = `${path.basename(itemPath)}.${input.archiveType}`;
    //         const archivePath = path.join(path.dirname(itemPath), archiveName);
    //         const output = fs.createWriteStream(archivePath);
    //         const archive = archiver(input.archiveType, { zlib: { level: 9 } });

    //         output.on('close', async () => {
    //             console.log(`Archive created: ${archivePath}`);
    //             await addToAssets(archivePath);
    //         });

    //         archive.on('error', err => {
    //             throw new Error(`Archive error: ${err.message}`);
    //         });

    //         archive.pipe(output);
    //         archive.directory(itemPath, false);
    //         await archive.finalize();
    //     } else {
    //         await addToAssets(itemPath);
    //     }
    // }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
