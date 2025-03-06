const fs = require("fs");
const core = require("@actions/core");
const { execSync } = require('child_process');
const path = require("path");
const Ajv = require('ajv');
const yaml = require('js-yaml');


async function assetsUpload(dest_path, ref) {
    const directoryPath = path.join(dest_path);

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            //
            core.setFailed(`Unable to scan directory: ${err}`);
            return console.error('Unable to scan directory: ' + err);
        }
        files.forEach(file => {
            const fullPath = path.join(directoryPath, file);
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                console.log(`Uploading ${fullPath} to ${dest_path}/${ref}/${file}`);
            }
        });
    });
}

async function run() {
    try {

        const jsonFile = core.getInput('config-path');
        const ref = core.getInput('ref');
        const dest_path = core.getInput('dest-path');
        const upload = core.getInput('upload');


        const configPath = path.resolve(jsonFile);
        console.log(`Reading asset config from ${configPath}`)

        if (!fs.existsSync(jsonFile)) {
            core.setFailed(`File not found: ${jsonFile}`);
            return;
        }

        const fileContent = fs.readFileSync(jsonFile, 'utf8');

        let config;
        try {
            config = yaml.load(fileContent);
        }
        catch (error) {
            core.setFailed(`Error parsing JSON file: ${error.message}`);
            return;
        }

        const schemaPath = path.resolve(__dirname, '..', 'config.schema.json');
        if (!fs.existsSync(schemaPath)) {
            core.setFailed(`Schema file not found: ${schemaPath}`);
            return;
        }

        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        let schema;
        try {
            schema = JSON.parse(schemaContent);
        }
        catch (error) {
            core.setFailed(`Error parsing JSON schema: ${error.message}`);
            return;
        }

        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(config);
        core.info(`Config file is valid: ${valid}`);
        if (!valid) {
            constErrors = ajv.errorsText(validate.errors);
            core.setFailed(`Config file is invalid: ${constErrors}`);
            return;
        }

        let createArchives = [];

        // Create dist folder for storing archives
        execSync('mkdir -p dist', {
            cwd: process.env.GITHUB_WORKSPACE,
            stdio: "inherit",
        });

        for (const archiveItem of config.archives) {
            let folder = archiveItem.folder;
            let archive = archiveItem.name;
            let archiveType = archiveItem.archiveType;

            if (!fs.existsSync(folder)) {
                throw new Error(`Folder not found: ${folder}`);
            }

            let outputFile = "";
            let command = "";

            if (archiveType == "tar.gz") {
                outputFile = `${archive}.tar.gz`;
                command = `tar -czf dist/${outputFile} ${folder}`;

            }
            else if (archiveType == "zip") {
                outputFile = `${archive}.zip`;
                command = `zip -r dist/${outputFile} ${folder}`;
            }
            else if (archiveType == "tar") {
                outputFile = `${archive}.tar`;
                command = `tar -cf dist/${outputFile} ${folder}`;
            }

            execSync(command, {
                cwd: process.env.GITHUB_WORKSPACE,
                stdio: "inherit",
            });

            // createArchives.push(outputFile)

            core.info(`Creating archive ${outputFile} from ${folder} archiveType: ${archiveType}`);;
        }

        core.setOutput('archives', createArchives);
        core.info(`Output archives: ${createArchives}`);

        if (upload) {
            await assetsUpload(dest_path, ref);
        }
    }
    catch (error) {
        core.setFailed(error.message)
    }
}

run();