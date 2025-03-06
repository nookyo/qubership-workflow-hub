const fs = require("fs");
const core = require("@actions/core");
const { execSync } = require('child_process');
const path = require("path");
const Ajv = require('ajv');
const yaml = require('js-yaml');


async function run() {
    try {

        jsonFile = core.getInput('config-path');
        const configPath = path.resolve(jsonFile);
        console.log(`Reading asset config from ${configPath}`)

        if (!fs.existsSync(jsonFile)) {
            core.setFailed(`File not found: ${jsonFile}`);
            return;
        }

        const fileContent = fs.readFileSync(jsonFile, 'utf8');

        let config;
        try {
            // config = JSON.parse(fileContent);
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
        if (!valid) {
            constErrors = ajv.errorsText(validate.errors);
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
            if(archiveType == "tar.gz") {
                outputFile = `${archive}.tar.gz`;
                command = `tar -czf dist/${outputFile} ${folder}`;

            }
            else if (archiveType == "zip") {
                outputFile = `${archive}.zip`;
                command = `zip -r dist/${outputFile} ${folder}`;
            }

            execSync(command, {
                cwd: process.env.GITHUB_WORKSPACE,
                stdio: "inherit",
            });

            createArchives.push(outputFile)
            core.info(`Creating archive ${outputFile} from ${folder} archiveType: ${archiveType}`);;
        }

        core.setOutput('archives', createArchives);
        core.info(`Output archives: ${createArchives}`);

    }
    catch (error) {
        core.setFailed(error.message)
    }
}

run();