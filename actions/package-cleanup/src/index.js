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
        username: owner,
        package_type: 'container',
    });
    // console.log("Package:", package.data);


    // console.log(`Package: ${package.data[0].name}`);
    // console.log(`Package type: ${package.data[0].package_type}`);


    // const version = await octokit.request('GET /users/{username}/packages/{package_name}/versions', {
    //     username: owner,
    //     package_name: package.data[0].name,
    //     package_type: package.data[0].package_type,
    // });
    // console.log(`Version: ${JSON.stringify(version.data)}`);
    // package.data.filter((pkg) => pkg.name === 'qubership-dbaas').forEach(async (pkg) => {
    //     console.log(`Package: ${pkg.name}`);
    //     console.log(`Package type: ${pkg.package_type}`);

    //     const version = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
    //         username: owner,
    //         package_type: pkg.package_type,
    //         package_name: pkg.name,
    //         headers: {
    //             'X-GitHub-Api-Version': '2022-11-28'
    //         }
    //     });
    //     console.log(`Version: ${JSON.stringify(version.data)}`);
    // });

    package.data.forEach(async (pkg) => {
        console.log(`Package: ${pkg.name}`);
        console.log(`Package type: ${pkg.package_type}`);

        const version = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
            username: owner,
            package_type: pkg.package_type,
            package_name: pkg.name,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.log(`Version: ${JSON.stringify(version.data)}`);
    });

    // const package_ver = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
    //     username: owner,
    //     package_type: 'container',
    //     package_name: 'qubership-dbaas',
    //     headers: {
    //         'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // });
    // core.warning("Package version:", package_ver.data);




    // const package_version = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
    //     username: 'nookyo',
    //     package_type: 'container',
    //     package_name: 'qubership-dbaas',
    //     headers: {
    //         'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // });
    // console.log("Package version:", package_version.data);



}

run();