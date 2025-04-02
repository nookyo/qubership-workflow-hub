const core = require("@actions/core");
const github = require("@actions/github");
const OctokitWrapper = require("./wrapper"); 

async function run() {

    const thresholdDays = 7;
    const excludedTags = ["main", "anotherTag"];

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);


    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    const wrapper = new OctokitWrapper(process.env.PACKAGE_TOKEN);

    let package = await wrapper.listPackages(owner, 'container', true);
    package.forEach(async (pkg) => {
        console.log(`Package: ${pkg.name}`);
        console.log(`Package type: ${pkg.package_type}`);
        let version = await wrapper.listVersionsForPackage(owner, pkg.package_type, pkg.name, true);
        console.log(`Version: ${JSON.stringify(version)}`);
    });

    //let package = await wrapper.listPackagesForUser(owner, 'container');


    // core.info(`Package: ${package}`);
    // package.forEach(async (pkg) => {
    //     console.log(`Package: ${pkg.name}`);
    //     console.log(`Package type: ${pkg.package_type}`);
    //     console.log(`Package version: ${pkg.id}`);


    //     const version = await wrapper.listPackageVersionsForUser(owner, pkg.package_type, pkg.name);
    //     console.log(`Version: ${JSON.stringify(version)}`);

    // });

    // const octokit = github.getOctokit(token);



    // const token = process.env.GITHUB_TOKEN;
    // const package_token = process.env.PACKAGE_TOKEN;


    // const octokit = github.getOctokit(token);

    // const userType = await octokit.request('GET /users/{username}', {
    //     username: owner
    // });

    // // 'User' or 'Organization'
    // console.log(`Type: ${JSON.stringify(userType.data, null, 2)}`);

    // let respond = await octokit.request('GET /user/packages', {
    //     package_type: 'container',
    //     headers: {
    //         'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // })

    // console.log(`Respond data: ${respond.data}`);

    // const package = await octokit.request('GET /users/{username}/packages', {
    //     username: owner,
    //     package_type: 'container',
    // });

    // for (const pkg of package.data) {
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
    //     core.warning(`Version: ${JSON.stringify(version.data)}`);

    //     const filteredPackages = version.data.filter(pkg => {

    //         const createdAt = new Date(pkg.created_at);
    //         const isOldEnough = createdAt <= thresholdDate;

    //         let hasExcludedTag = false;
    //         if (pkg.metadata && pkg.metadata.container && Array.isArray(pkg.metadata.container.tags)) {

    //             hasExcludedTag = pkg.metadata.container.tags.some(tag =>
    //                 excludedTags.includes(tag)
    //             );
    //         }

    //         return isOldEnough && !hasExcludedTag;
    //     });
    //     console.log(filteredPackages);
    // }



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

    // package.data.forEach(async (pkg) => {
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
    //     core.warning(`Version: ${JSON.stringify(version.data)}`);
    // });

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