const core = require("@actions/core");
const github = require("@actions/github");

async function run() {

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    const token = process.env.GITHUB_TOKEN;
    const package_token = process.env.PACKAGE_TOKEN;
    const octokit = github.getOctokit(package_token);
    // const octokit = github.getOctokit(token);

    const userType = await octokit.request('GET /users/{username}', {
        username: owner
    });

    // 'User' or 'Organization'
    console.log(`Type: ${JSON.stringify(userType.data, null, 2)}`);

    let respond = await octokit.request('GET /user/packages', {
        package_type: 'container',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    console.log(`Respond data: ${respond.data}`);

    const package = await octokit.request('GET /users/{username}/packages', {
        username: 'nookyo',
        package_type: 'container',
    });
    console.log("Package:", package.data);

    package.data.map(async (pkg) => {

        console.log(`Package: ${pkg.name}`);

        const version = await octokit.request('GET /users/{username}/packages/{package_name}/versions', {
            username: owner,
            package_name: pkg.name,
            package_type: pkg.package_type
        });
        console.log(`Version: ${JSON.stringify(version.data)}`);
    });


}

run();