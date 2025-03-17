const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");

function findFile(filename, startDir = process.cwd()) {
    let dir = startDir;
    while (dir !== path.parse(dir).root) {
        const filePath = path.join(dir, filename);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
        dir = path.dirname(dir);
    }
    return null;
}

function getUsersFromCodeowners() {
    const codeownersPath = findFile('CODEOWNERS');
    if (!codeownersPath) {
        core.info(`🔍 CODEOWNERS file found on: ${codeownersPath}`);
        const codeownersContent = fs.readFileSync(codeownersPath, 'utf8');
        const lines = codeownersContent.split('\n');
        const userLine = lines.find(line => line.trim().startsWith('*'));
        return userLine.split(/\s+/).slice(1).map(user => user.replace('@', ''));
    }
    return [];
}

async function run() {
    const defaultConfigurationPath = ".github/pr-assigner.yml";
    const configurationPath = core.getInput("configuration-path") || defaultConfigurationPath;

    let assignees = [];

    if (fs.existsSync(configurationPath)) {
        const content = ConfigLoader().load(configurationPath);
        assignees = content['assignees'];
        core.info(`Debug use configuration file`)
    }
    else {
        assignees = getUsersFromCodeowners();
        if (assignees == null) {
            core.setFailed(`❗️ Cant load assignees from CODEOWNERS file`);
            return;
        }
        core.info(`Debug use CODEOWNERS file`)
    }
}

run();