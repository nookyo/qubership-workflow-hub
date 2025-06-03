const fs = require("fs");
const path = require("path");
const { github } = require("@actions/github");


class AssetUploader {
    constructor(token, releaseTag, owner, repo) {
        this.token = token;
        this.releaseTag = releaseTag;
        this.octokit = github.

        this.owner = owner || null;
        this.repo = repo || null;
        this.releaseId = null;
    }

    async toString() {
        return `AssetUploader: { owner: ${this.owner}, repo: ${this.repo}, releaseTag: ${this.releaseTag} }`;
    }

    async init() {

        this.owner = owner;
        this.repo = repo;

        const release = await this.octokit.rest.repos.getReleaseByTag({
            owner,
            repo,
            tag: this.releaseTag,
        });

        this.releaseId = release.data.id;
    }

    async upload(assetPath) {

        if (!this.owner || !this.repo || !this.releaseId) {
            throw new Error("AssetUploader has not been initialized. Call init() first.");
        }

        const releaseId = this.releaseId;
        const assetName = path.basename(assetPath);

        await this.octokit.rest.repos.uploadReleaseAsset({
            owner: this.owner,
            repo: this.repo,
            release_id: releaseId,
            name: assetName,
        });
    }
}

module.exports = AssetUploader



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