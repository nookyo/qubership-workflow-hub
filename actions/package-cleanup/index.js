const core = require('@actions/core');

// Если вы используете Node.js версии <18, можно установить пакет node-fetch:
// const fetch = require('node-fetch');
const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const username = core.getInput('username', { required: true });
    const token = core.getInput('token', { required: true });
    const url = `https://api.github.com/users/${username}/packages?package_type=CONTAINER`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.packages-preview+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Контейнерные пакеты:', data);

    // Передаём результат через output для дальнейшего использования в workflow
    core.setOutput('packages', JSON.stringify(data));
  } catch (error) {
    core.setFailed(`Ошибка при выполнении действия: ${error.message}`);
  }
}

run();