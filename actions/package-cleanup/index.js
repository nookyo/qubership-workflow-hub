const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const octokit = github.getOctokit(token);

  try {
    const response = await octokit.request('GET /users/{username}/packages/{package_type}/{package_name}/versions', {
      username: 'nookyo',
      package_type: 'container',
      package_name: 'qubership-dbaas',
      headers: {
         'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log("Все версии пакета:", response.data);
  } catch (error) {
    console.error("Ошибка:", error.message);
    console.error("Детали:", error.response?.data || error);
  }
}

run();