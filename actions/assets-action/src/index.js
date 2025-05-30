const fs = require("fs");
const core = require("@actions/core");
const { execSync } = require('child_process');
const path = require("path");
const Ajv = require('ajv');
const yaml = require('js-yaml');
const Loader = require("./loader");

async function assetsUpload(dist_path, ref) {
    const directoryPath = path.join(dist_path);
    try {
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            const fullPath = path.join(directoryPath, file);
            if (fs.statSync(fullPath).isFile()) {
                console.log(`🔄 Uploading ${fullPath} to ${ref}`);
                execSync(`gh release upload ${ref} ${fullPath} --clobber`, {
                    stdio: "inherit",
                });
            }
        }
    } catch (err) {
        throw err;
    }
}

async function getInput() {
    return {
        configPath: core.getInput('config-path'),
        ref: core.getInput('ref') || process.env.GITHUB_REF_NAME,
        distPath: core.getInput('dist-path'),
        dryRun: core.getInput('dry-run') || 'false',
        debug: core.getInput('debug') || 'false',
        showReport: core.getInput('show-report') || 'false'
    }
}

async function run() {
    try {

        const input = await getInput();

        core.info(`Debug:\n 🔹json: ${input.configPath}\n 🔹ref: ${input.ref}\n 🔹distPath: ${input.distPath}\n`);

        const config = await new Loader().loadConfig(input.configPath);

        fs.mkdirSync(input.distPath, { recursive: true })

        if (Array.isArray(config.archives) && config.archives.length) {
            for (const archiveItem of config.archives) {
                let source = archiveItem.source;
                let outputName = archiveItem.outputName;
                let archiveType = archiveItem.archiveType;

                if (!fs.existsSync(source)) {
                    throw new Error(`❗️ Folder not found: ${source}`);
                }

                let outputFile = "";
                let command = "";

                if (archiveType == "tar.gz") {
                    outputFile = `${outputName}-${input.ref}.tar.gz`;
                    command = `tar -czf ${input.distPath}/${outputFile} ${source}`;

                }
                else if (archiveType == "zip") {
                    outputFile = `${outputName}-${input.ref}.zip`;
                    command = `zip -r ${input.distPath}/${outputFile} ${source}`;
                }
                else if (archiveType == "tar") {
                    outputFile = `${outputName}-${input.ref}.tar`;
                    command = `tar -cf ${input.distPath}/${outputFile} ${source}`;
                }

                execSync(command, {
                    cwd: process.env.GITHUB_WORKSPACE,
                    stdio: "inherit",
                });

                core.info(`🧱 Creating archive ${outputFile} from ${source} archiveType: ${archiveType}`);;
            }
        }
        else {
            core.info(`⚠️ No archives provided for processing`);
        }

        if (Array.isArray(config.files) && config.files.length) {
            for (const fileItem of config.files) {
                const source = fileItem.source;
                const outputName = fileItem.outputName;

                if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
                    throw new Error(`❗️ File not found: ${source}`);
                }

                const ext = path.extname(source) || '';
                const destName = `${outputName}-${input.ref}.${ext}`;
                const destPath = path.join(input.distPath, destName);
                fs.copyFileSync(source, destPath);
                core.info(`🗂️ Copied file ${source} → ${destPath}`);
            }
        } else {
            core.info(`⚠️ No individual files provided for processing`);
        }

        if (input.dryRun === 'true') {
            core.warning(` Dry run mode: no files will be uploaded to assets.`);
            return;
        }

        await assetsUpload(input.distPath, input.ref);
        core.info('✅ Action completed successfully!');
    }
    catch (error) {
        core.setFailed(`❌ Action failed: ${error.message}`);
    }
}

run();