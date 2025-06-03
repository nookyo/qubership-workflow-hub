const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");


async function addToArchive(itemPath, archiveType) {

  const stat = await fs.promises.stat(itemPath);
  if (!stat.isDirectory()) {
    return itemPath;
  }

  const archiveName = `${path.basename(itemPath)}.${archiveType}`;
  const archivePath = path.join(path.dirname(itemPath), archiveName);

  const output = fs.createWriteStream(archivePath);
  const archive = archiver(archiveType, { zlib: { level: 9 } });

  output.on("close", () => {
    core.info(`Archive created: ${archivePath}`);
  });

  archive.on("error", (err) => {
    throw new Error(`Archive error: ${err.message}`);
  });

  archive.pipe(output);
  archive.directory(itemPath, false);

  await archive.finalize();

  return archivePath;
}

module.exports = {
  addToArchive,
};