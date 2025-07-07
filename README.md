# Qubership Workflow Hub

A comprehensive collection of reusable GitHub Actions and Workflows, designed to streamline your CI/CD pipelines and development processes.

## 📑 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Available Actions](#available-actions)
- [Reusable Workflows](#reusable-workflows)
- [Additional Documentation](#additional-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🔍 Overview

Qubership Workflow Hub provides:

- **GitHub Actions**: Modular, reusable actions to automate tasks like versioning, tagging, publishing, and more.
- **Reusable Workflows**: Prebuilt workflow templates for typical release and deployment processes.
- **Comprehensive Documentation**: Guides, examples, and reference tables to help you integrate these actions and workflows quickly.

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/nookyo/qubership-workflow-hub.git
   cd qubership-workflow-hub
   ```

2. **Explore Actions and Workflows**
   - Browse the [`actions/`](actions/) folder for individual action packages.
   - Browse the [`docs/reusable/`](docs/reusable/) folder for workflow templates.

3. **Use an Action**
   Reference an action in your own workflow YAML:
   ```yaml
   jobs:
     tag:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Create a Git Tag
           uses: nookyo/qubership-workflow-hub/actions/tag-action@main
           with:
             tag-prefix: "v"
             tag-message: "Release {{version}}"
   ```

4. **Use a Reusable Workflow**
   Include a reusable workflow by path:
   ```yaml
   jobs:
     release:
       uses: nookyo/qubership-workflow-hub/docs/reusable/release-drafter.md@main
       with:
         config-file: ".github/release-drafter.yml"
   ```
   > **Note:** Consult the individual workflow docs for specific input parameters and examples.

---

## ⚙️ Available Actions

Below is a list of all core Actions provided in this repository. Click the action name to view detailed usage instructions.

- [archive-and-upload-assets](actions/archive-and-upload-assets/README.md)
- [assets-action](actions/assets-action/README.md)
- [cdxgen](actions/cdxgen/README.md)
- [chart-release](actions/chart-release/README.md)
- [chart-release-action](actions/chart-release-action/README.md)
- [chart-version](actions/chart-version/README.md)
- [commit-and-push](actions/commit-and-push/README.md)
- [container-package-cleanup](actions/container-package-cleanup/README.md)
- [custom-event](actions/custom-event/README.md)
- [docker-action](actions/docker-action/README.md)
- [helm-charts-release](actions/helm-charts-release/README.md)
- [maven-release](actions/maven-release/README.md)
- [maven-snapshot-deploy](actions/maven-snapshot-deploy/README.md)
- [metadata-action](actions/metadata-action/README.md)
- [poetry-publisher](actions/poetry-publisher/README.md)
- [pom-updater](actions/pom-updater/README.md)
- [pr-add-messages](actions/pr-add-messages/README.md)
- [pr-assigner](actions/pr-assigner/README.md)
- [store-input-params](actions/store-input-params/README.md)
- [tag-action](actions/tag-action/README.md)
- [tag-checker](actions/tag-checker/README.md)
- [verify-json](actions/verify-json/README.md)

---

## 🔄 Reusable Workflows

Preconfigured workflow templates you can import into your projects:

- [broadcast-files](docs/reusable/broadcast-files.md)
- [docker-publish](docs/reusable/docker-publish.md)
- [github-release](docs/reusable/github-release.md)
- [maven-publish](docs/reusable/maven-publish.md)
- [pom-updater](docs/reusable/pom-updater.md)
- [python-publish](docs/reusable/python-publish.md)
- [release-drafter](docs/reusable/release-drafter.md)
- [tag-creator](docs/reusable/tag-creator.md)

---

## 📚 Additional Documentation

- [Workflow and Action Documentation](docs/README.md)
- [Fork Sequence Guide](docs/fork-sequence.md)
- [Maven POM Preparation](docs/maven-publish-pom-preparation_doc.md)
- [Maven Publish Secrets](docs/maven-publish-secrets_doc.md)
- [Contributor License Agreement (CLA)](CLA/cla.md)

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Review and sign the [CLA](CLA/cla.md).
2. Check the [CODEOWNERS](CODEOWNERS) file for areas of responsibility.
3. Open an issue to discuss your changes.
4. Submit a pull request with tests and documentation updates.

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).
