const exec = require("@actions/exec");
class HelmWrapper {
    constructor(helm) {
        this.helm = helm;
    }

    async lintChart(chartPath) {
        return exec.exec('helm', ['lint', chartPath]);
    }

    async dependencyUpdate(chartPath) {
        return exec.exec('helm', ['dependency', 'update', chartPath]);
    }
}


module.exports = HelmWrapper;