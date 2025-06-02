const core = require('@actions/core');
const { exec } = require('child_process');
const fs = require('fs');


function getInputs() {
    return {
        tag: core.getInput('tag', { required: true }),
        folder: core.getInput('path', { required: true }),
        retries: parseInt(core.getInput('retries') || '3', 10),
        retryDelayMs: parseInt(core.getInput('retry-delay-ms') || '2000', 10),
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadAssets(tag, files, maxRetries = 3, delayMs = 2000) {
    const fileArgs = files.map(f => `"${f}"`).join(' ');
    const command = `gh release upload "${tag}" ${fileArgs} --clobber`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: ${command}`);
            exec(command, {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    GITHUB_TOKEN: process.env.GITHUB_TOKEN
                }
            });
            console.log('✅ Assets uploaded successfully.');
            return;
        } catch (err) {
            if (attempt < maxRetries) {
                console.warn(`⚠️ Upload failed (attempt ${attempt}). Retrying in ${delayMs}ms...`);
                await delay(delayMs); // synchronous delay
            } else {
                throw new Error(`❌ Upload failed after ${maxRetries} attempts: ${err.message}`);
            }
        }
    }
}


async function run() {
    try {
        const { tag, folder, retries, retryDelayMs } = getInputs();

        if (!fs.existsSync(folder)) {
            core.setFailed(`❌ Folder not found: ${folder}`);
            return;
        }

        const files = fs.readdirSync(folder)
            .map(name => path.join(folder, name))
            .filter(p => fs.statSync(p).isFile());

        if (files.length === 0) {
            core.warning(`⚠️ No files found in: ${folder}`);
            return;
        }

        await uploadAssets(tag, files, retries, retryDelayMs);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

