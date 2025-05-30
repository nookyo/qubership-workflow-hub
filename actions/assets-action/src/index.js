const core = require('@actions/core');
const { execSync } = require('child_process');
const fs = require('fs');

async function run() {
  try {
    const tag = core.getInput('tag');
    const folder = core.getInput('path');

    if (!fs.existsSync(folder)) {
      core.setFailed(`Folder not found: ${folder}`);
      return;
    }

    const files = fs.readdirSync(folder)
      .map(f => `${folder}/${f}`)
      .filter(f => fs.statSync(f).isFile());

    if (files.length === 0) {
      core.warning(`No files found in: ${folder}`);
      return;
    }

    const fileArgs = files.map(f => `"${f}"`).join(' ');
    
    const cmd = `gh release upload "${tag}" ${fileArgs} --clobber`;

    console.log(`Running: ${cmd}`);
    execSync(cmd, {
      stdio: 'inherit',
      env: {
        ...process.env,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN
      }
    });

    console.log('Assets uploaded successfully.');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
