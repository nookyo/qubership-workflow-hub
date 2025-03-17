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


async function run() {
    const defaultConfigurationPath = ".github/pr-assigner.yml";
    const configurationPath = core.getInput("configuration-path") || defaultConfigurationPath;

    const configContent = null; // = new ConfigLoader().load(configurationPath);

    if (configContent == null) {
        const codeownersPath = findFile('CODEOWNERS');

        core.info( `Path: ${codeownersPath}` );
        if (codeownersPath) {
            core.info(`🔍 CODEOWNERS file found: ${codeownersPath}`);
            const codeownersContent = fs.readFileSync(codeownersPath, 'utf8');

            const userLine = lines.find(line => line.trim().startsWith('*'));

            core.info(` Userline: ${userLine}` );

            // if (!userLine) {
            //     core.info('❗️ No default user found in CODEOWNERS file');
            //     return;
            // }

            // const users = userLine.split(/\s+/).slice(1).map(user => user.replace('@', ''));
            // core.info(`🔍 CODEOWNERS: ${users.join(', ')}`);



            // const codeowners = codeownersContent.split('\n')
            //     .filter(line => line.trim().length > 0 && !line.startsWith('#'))
            //     .map(line => line.split(/\s+/)[1]);
            // core.info(`🔍 CODEOWNERS: ${codeowners.join(', ')}`);
            // configContent = { assignees: codeowners };
        }
    }
}

run();