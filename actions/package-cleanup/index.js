const { graphql } = require("@octokit/graphql");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const token = process.env.GITHUB_TOKEN;
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    const octokit = github.getOctokit(token);

    //   const octokit = github.getOctokit(token);
    //   const packageTypes = ["npm", "maven", "rubygems", "nuget", "docker"];
    //   try {
    //     const response = await octokit.rest.packages.listPackageVersionsForUser({
    //       username: 'nookyo',
    //       package_type: 'container',          // замените на нужный тип пакета
    //       package_name: 'qubership-dbaas'      // замените на имя пакета
    //     });
    //     console.log("Версии пакета:", response.data);
    //   } catch (error) {
    //     console.error("Ошибка при получении версий пакета:", error);
    //   }


    // const response = await octokit.rest.packages.listPackagesForOrganization ({
    //     package_type: 'container',
    //     org: owner,
    // });
    // const response = octokit.rest.packages.listPackagesForAuthenticatedUser({
    //     package_type: 'container',
    //   });

    // console.log("Package version:", response.data);


    const response_user = await octokit.rest.packages.listPackagesForUser({
        package_type: 'docker',
        username: owner,
      });

    console.log("Package:", response_user.data);


    const version = await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser({
        package_type: 'container',
        package_name: 'qubership-dbaas',
        username: owner,
    });
    console.log("Package version:", version.data);

    version.data.forEach((item) => {
        console.log("Version metadata:", item.metadata.container);
    });


    let package_version_restapi = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
        package_type: 'container',
        package_name: 'qubership-dbaas',
        username: owner,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      console.log("Package version:", package_version_restapi.data);

      const list_package_roa_user = await octokit.request('GET /users/{username}/packages', {
        username: owner,
        package_type: 'container',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      console.log("Package version:", list_package_roa_user.data);


    // const package_version = await octokit.request('GET /organization/{username}/packages/{package_type}/{package_name}/versions', {
    //     username: owner,
    //     package_type: 'container',
    //     package_name: 'qubership-dbaas',
    //     headers: {
    //         'X-GitHub-Api-Version': '2022-11-28'
    //     }
    // });
    // console.log("Package version:", package_version.data);


}

run();
