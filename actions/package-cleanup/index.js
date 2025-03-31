const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const repository = github.context.repo;
    console.log(`Assembly run on: ${repository.owner}/${repository.repo}`);
    console.log(`Event: ${github.context.eventName}`);

    const token = process.env.GITHUB_TOKEN;
    const [owner] = process.env.GITHUB_REPOSITORY.split('/');
    const octokit = github.getOctokit(token);

    try {
        // Используем эндпоинт для получения пакетов с указанием package_type
        const response = await octokit.request('GET /users/{username}/packages', {
            username: owner,
            package_type: 'container' // Укажите тип пакета, например, 'container'
        });

        console.log("Packages:", response.data);
    } catch (error) {
        console.error("Error:", error.message);
        console.error("Details:", error.response?.data || error);
    }
}

run();