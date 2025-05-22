import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
    try {
        const name = core.getInput('name', { required: true });
        console.log(`Hello, ${name}!`);

        const ctx = github.context;
        console.log(`Event: ${ctx.eventName}`);

        core.setOutput('greeting', `Hello, ${name}!`);
    } catch (error: any) {
        core.setFailed(error.message);
    }
}

run();