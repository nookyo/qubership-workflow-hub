const { graphql } = require("@octokit/graphql");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const octokit = github.getOctokit(token);

  try {
    // Выполняем параллельно запросы для всех типов пакетов
    const results = await Promise.all(
      packageTypes.map(async (type) => {
        try {
          const response = await octokit.rest.packages.listPackagesForUser({
            username,
            package_type: type,
            per_page: 100, // число элементов на страницу
          });
          return response.data;
        } catch (error) {
          console.error(`Ошибка для типа ${type}:`, error.message);
          return [];
        }
      })
    );

    // Объединяем результаты из всех типов
    const allPackages = results.flat();
    console.log("Все пакеты пользователя:", allPackages);
  } catch (error) {
    console.error("Общая ошибка:", error.message);
  }
}

run();
