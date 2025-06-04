const core = require('@actions/core');

   async function retryAsync(fn, options = {}) {
    let { retries = 3, delay = 1000, factor = 1 } = options;

    let constDelay = delay;
    while (retries > 0) {
        try {
            return await fn();
        } catch (error) {
            retries--;
            if (retries === 0) {
                throw error;
            }
            console.warn(`Retrying due to error: ${error.message}. Retries left: ${retries}. Delay: ${delay}ms`);
            constDelay *= factor; // Increase delay for next retry
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("Unknow error. All retries failed.");
}

exports.retryAsync = retryAsync;