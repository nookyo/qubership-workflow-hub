const { graphql } = require("@octokit/graphql");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const octokit = github.getOctokit(token);

  try {
    const username = "nookyo";  // Имя пользователя, для которого запрашиваем пакеты
    const packageType = "docker";   // Укажите нужный тип пакета (npm, maven, rubygems, nuget, docker и т.д.)

    const response = await octokit.rest.packages.listPackagesForUser({
      username: username,
      package_type: packageType,
      per_page: 100,  // Можно задать количество элементов на страницу
    });

    console.log("Packages:", response.data);
  } catch (error) {
    console.error("Error retrieving packages:", error);
  }
}

run();
