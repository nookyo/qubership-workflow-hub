const fs = require("fs");
const core = require("@actions/core");
const { execSync } = require('child_process');
const path = require("path");
const Ajv = require('ajv');
const yaml = require('js-yaml');


async function assetsUpload(dest_path, ref) {
    const directoryPath = path.join(__dirname, 'dist');

    try {
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            const fullPath = path.join(directoryPath, file);
            if (fs.statSync(fullPath).isFile()) {
                console.log(`🔄 Uploading ${fullPath} to ${dest_path}/${ref}/${file}`);
            }
        }
    } catch (err) {
        core.setFailed(`❗️ Unable to scan directory: ${err}`);
        return;
    }
}

async function run() {
    try {

        const jsonFile = core.getInput('config-path');
        const ref = core.getInput('ref');
        const dist_path = core.getInput('dest-path');
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
            core.setFailed(`❗️ Config file is invalid: ${constErrors}`);
            return;
        }
        core.warning(`Config file is valid: ${valid}`);

        // Create dist folder for storing archives
        fs.mkdirSync(dist_path, { recursive: true })
        for (const archiveItem of config.archives) {
            let folder = archiveItem.folder;
            let archive = archiveItem.name;
            let archiveType = archiveItem.archiveType;

            if (!fs.existsSync(folder)) {
                throw new Error(`❗️ Folder not found: ${folder}`);
            }

            let outputFile = "";
            let command = "";

            if (archiveType == "tar.gz") {
                outputFile = `${archive}-${ref}.tar.gz`;
                command = `tar -czf ${dist_path}/${outputFile} ${folder}`;

            }
            else if (archiveType == "zip") {
                outputFile = `${archive}-${ref}.zip`;
                command = `zip -r ${dist_path}/${outputFile} ${folder}`;
            }
            else if (archiveType == "tar") {
                outputFile = `${archive}-${ref}.tar`;
                command = `tar -cf ${dist_path}/${outputFile} ${folder}`;
            }

            execSync(command, {
                cwd: process.env.GITHUB_WORKSPACE,
                stdio: "inherit",
            });

            core.info(`🧱 Creating archive ${outputFile} from ${folder} archiveType: ${archiveType}`);;
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