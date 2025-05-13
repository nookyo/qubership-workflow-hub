const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");
const Ajv = require("ajv");
const path = require("path");

class ConfigLoader {
  constructor() {
    this.fileExist = true;
  }

  get fileExists() {
    return this.fileExist;
  }

  load(filePath, debug = false) {
    const configPath = path.resolve(filePath);
    console.log(`💡 Try to reading configuration ${configPath}`)

    if (!fs.existsSync(configPath)) {
      core.warning(`❗️ Configuration file not found: ${configPath}`);
      this.fileExist = false;
      return;
    }

    const fileContent = fs.readFileSync(configPath, 'utf8');

    let config;
    try {
      config = yaml.load(fileContent);
      if (debug) {
        console.log("🔍 Loaded configuration JSON:", JSON.stringify(config, null, 2));
        console.log("🔑 Object Keys:", Object.keys(config));
      }
    }
    catch (error) {
      core.setFailed(`❗️ Error parsing YAML file: ${error.message}`);
      return;
    }

    const schemaPath = path.resolve(__dirname, '..', 'config.schema.json');
    if (!fs.existsSync(schemaPath)) {
      core.setFailed(`❗️ Schema file not found: ${schemaPath}`);
      return;
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    let schema;
    try {
      schema = JSON.parse(schemaContent);
    }
    catch (error) {
      core.setFailed(`❗️ Error parsing JSON schema: ${error.message}`);
      return;
    }

    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(config);
    if (!valid) {
      let errors = ajv.errorsText(validate.errors);
      core.setFailed(`❗️ Configuration file is invalid: ${errors}`);
      return;
    }
    core.info(`💡 Configuration file is valid: ${valid}`);
    return config;
  }
}

module.exports = ConfigLoader;