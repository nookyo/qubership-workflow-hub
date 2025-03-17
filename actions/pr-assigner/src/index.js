const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const ConfigLoader = require("./loader");
const { execSync } = require("child_process");

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
    const defaultConfigurationPath = ".github/pr-assigner-config.yml";
    const configurationPath = core.getInput("configuration-path") || defaultConfigurationPath;

    let assignees = [];

    if (fs.existsSync(configurationPath)) {
        const content = new ConfigLoader().load(configurationPath);
        assignees = content['assignees'];
        core.warning(`Use configuration file ${configurationPath}`)
    }
    else {
        assignees = getUsersFromCodeowners();
        if (assignees == null) {
            core.setFailed(`❗️ Cant process CODEOWNERS file`);
            return;
        }
        core.warning(`Use CODEOWNERS file`)
    }


    try {
        const pullRequest = github.context.payload.pull_request;
        if (!pullRequest) {
            core.setFailed("❗️ Action have to run on pull request.");
            process.exit(1);
        }

        const cmd = `gh pr edit ${pullRequest.number} --add-assignee ${assignees}`
        
        execSync.run(cmd, { stdio: 'inherit' });


    } catch (error) {
        core.setFailed(`❗️ ${error.message}`);
    }
}

run();