const { graphql } = require("@octokit/graphql");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const octokit = github.getOctokit(token);

  try {
    const response = await octokit.rest.packages.listPackagesForUser({
        username: 'nookyo',
        package_type: 'docker' // или 'maven', 'rubygems', 'nuget', 'docker'
      });
      console.log(response.data);
  
    console.log("Repository packages:", result.repository.packages.nodes);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
