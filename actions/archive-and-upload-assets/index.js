const fs = require("fs");
const core = require("@actions/core");
const { execSync } = require('child_process');
const path = require("path");
const Ajv = require('ajv');
const yaml = require('js-yaml');


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

async function run() {
    try {

        const jsonFile = core.getInput('config-path');
        const ref = core.getInput('ref') || process.env.GITHUB_REF_NAME;
        const dist_path = core.getInput('dist-path');
        const upload = core.getInput('upload');

        core.info(`Debug:\n 🔹json: ${jsonFile}\n 🔹ref: ${ref}\n 🔹dist_path: ${dist_path}\n 🔹upload: ${upload}\n`);


        const configPath = path.resolve(jsonFile);
        console.log(`💡 Reading asset config from ${configPath}`)

        if (!fs.existsSync(jsonFile)) {
            core.setFailed(`❗️ File not found: ${jsonFile}`);
            return;
        }

        const fileContent = fs.readFileSync(jsonFile, 'utf8');

        let config;
        try {
            config = yaml.load(fileContent);
        }
        catch (error) {
            core.setFailed(`❗️ Error parsing YAML file: ${error.message}`);
            return;
        }

        const schemaPath = path.resolve(__dirname, '..', 'config.schema.json');
        if (!fs.existsSync(schemaPath)) {
            core.setFailed(`❗️ Schema file not found: ${schemaPath}`);
            return;
        }

        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        let schema;
        try {
            schema = JSON.parse(schemaContent);
        }
        catch (error) {
            core.setFailed(`❗️ Error parsing JSON schema: ${error.message}`);
            return;
        }

        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(config);
        if (!valid) {
            constErrors = ajv.errorsText(validate.errors);
            core.setFailed(`❗️ Configuration file is invalid: ${constErrors}`);
            return;
        }
        core.warning(`Config file is valid: ${valid}\n`);

        // Create dist folder for storing archives
        fs.mkdirSync(dist_path, { recursive: true })
        if (!config.archives || config.archives.length != 0) {
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
                    outputFile = `${outputName}-${ref}.tar.gz`;
                    command = `tar -czf ${dist_path}/${outputFile} ${source}`;

                }
                else if (archiveType == "zip") {
                    outputFile = `${outputName}-${ref}.zip`;
                    command = `zip -r ${dist_path}/${outputFile} ${source}`;
                }
                else if (archiveType == "tar") {
                    outputFile = `${outputName}-${ref}.tar`;
                    command = `tar -cf ${dist_path}/${outputFile} ${source}`;
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

        if (!config.files || config.files.length != 0) {
            for (const fileItem of config.files) {
                const source = fileItem.source;
                const outputName = fileItem.outputName;

                if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
                    throw new Error(`❗️ File not found: ${source}`);
                }

                const ext = path.extname(source) || '';
                const destName = `${outputName}-${ref}.${ext}`;
                const destPath = path.join(dist_path, destName);
                fs.copyFileSync(source, destPath);
                core.info(`🗂️ Copied file ${source} → ${destPath}`);
            }
        } else {
            core.info(`⚠️ No individual files provided for processing`);
        }

        if (upload === 'true') {
            await assetsUpload(dist_path, ref);
        }
        core.info('✅ Action completed successfully!');
    }
    catch (error) {
        core.setFailed(`❌ Action failed: ${error.message}`);
    }
}

run();