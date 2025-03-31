import * as core from '@actions/core';

async function run() {
  try {

    const name: string = "Fucker"
    core.info(`Привет, ${name}!`);

    core.setOutput('greeting', `Hello, ${name}!`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();