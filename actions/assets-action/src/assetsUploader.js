const { execSync } = require("child_process");
const path = require("path");

class AssetUploader {
    constructor(token, releaseTag, owner, repo) {
        this.token = token;
        this.releaseTag = releaseTag;
        this.owner = owner;
        this.repo = repo;
    }

    async toString() {
        return `AssetUploader: { owner: ${this.owner}, repo: ${this.repo}, releaseTag: ${this.releaseTag} }`;
    }

    async upload(assetPath) {
        if (!this.owner || !this.repo || !this.releaseTag) {
            throw new Error(`❗️ Incorrect initialization of AssetUploader: { owner: ${this.owner}, repo: ${this.repo}, releaseTag: ${this.releaseTag} }`);
        }

        const fileName = path.basename(assetPath);
        const absPath = path.resolve(assetPath);
        const repoArg = `${this.owner}/${this.repo}`;

        try {
            const cmd = [
                "gh", "release", "upload",
                this.releaseTag,
                `"${absPath}"`,
                "--repo", repoArg,
                "--clobber"
            ].join(" ");

            console.info(`Try Uploading asset: ${fileName} to release: ${this.releaseTag} in repo: ${repoArg}`);
            execSync(cmd, { stdio: "inherit", env: process.env });
            console.info(`✔️ Asset uploaded successfully: ${fileName} \n`);
        } catch (err) {
            throw new Error(`Catched error while uploading asset: ${err.message}`);
        }
    }
}

module.exports = AssetUploader;

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