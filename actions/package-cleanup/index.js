const { graphql } = require("@octokit/graphql");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const octokit = github.getOctokit(token);
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

        const package_version = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
            username: 'nookyo',
            package_type: 'container',
            package_name: 'qubership-dbaas',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.log("Package version:", package_version.data);


}

run();
