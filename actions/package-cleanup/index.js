const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);

    try {

        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const response = await octokit.request('GET /users/{username}', {
            username: owner
        });

        const userType = response.data.type; // 'User' или 'Organization'
        console.log(`Type: ${userType}`);

        if (userType === 'User') {
            console.log(`${owner} it is User.`);
        } else if (userType === 'Organization') {
            console.log(`${owner} it is Org.`);
        }

        const package = await octokit.request('GET /users/{username}/packages', {
            username: 'nookyo',
            package_type: 'container',
        });
        console.log("Package version:", package.data);

        const package_version = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
            username: 'nookyo',
            package_type: 'container',
            package_name: 'qubership-dbaas',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.log("Package version:", package_version.data);
    } catch (error) {
        console.error("error:", error.message);
        console.error("detail:", error.package_version?.data || error);
    }
}

run();