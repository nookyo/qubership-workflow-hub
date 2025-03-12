const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");

class ConfigLoader {
  constructor() {
  }

  load(filePath, schemaPath) {
    const configPath = path.resolve(filePath);
    console.log(`💡 Reading asset config from ${configPath}`)

    if (!fs.existsSync(configPath)) {
      core.setFailed(`❗️ File not found: ${configPath}`);
      return;
    }

    const fileContent = fs.readFileSync(configPath, 'utf8');

    let config;
    try {
      config = yaml.load(fileContent);
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
      constErrors = ajv.errorsText(validate.errors);
      core.setFailed(`❗️ Configuration file is invalid: ${constErrors}`);
      return;
    }
    core.warning(`Configuration file is valid: ${valid}\n`);
    return config;
 
    // try {
    //   const fileContents = fs.readFileSync(this.configPath, "utf8");
    //   return yaml.load(fileContents);
    // } catch (e) {
    //   core.error(`Failed to load config.yml: ${e}`);
    //   return {};
    // }
  }
}

module.exports = ConfigLoader;