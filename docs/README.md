# Qubership Workflow Hub

A comprehensive collection of reusable GitHub Actions and Workflows, designed to streamline your CI/CD pipelines and development processes.

## 🔍 Overview
Centralises common CI/CD tasks (tagging, version / metadata generation, artifact & package publishing, Helm chart release, cleanup, custom events) to avoid per‑repo scripts and drift.

Key pieces:
- Actions (single focused step) – `actions/<name>/`
- Reusable workflows (multi‑job orchestration) – `reusable/*.md`
- Conventions (rules: naming, version pinning, permissions) – `conventions.md`

Core principles: deterministic (pin @v1 or SHA), least privilege (start with `contents: read`), composable (small actions), backwards compatible majors, observable outputs, explicit deprecation with replacement.

Use an Action for one operation (tag, compute metadata, cleanup). Use a Reusable Workflow for multi‑job pipelines (build + test + publish). Combine both freely.

Version & security: pin versions, avoid `@main`, run dry‑run first where supported, elevate permissions only where needed.

To extend: add action folder + README, update index, tag `v1`, adjust conventions if introducing a new pattern.

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

  Need to contribute? Read the fork workflow: [Fork Sequence Guide](docs/fork-sequence.md).

  ---
  ## 📘 Conventions
  Shared patterns (naming, inputs, version pinning, permissions, security hardening) are documented in [docs/conventions.md](docs/conventions.md).

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

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Review and sign the [CLA](CLA/cla.md).
2. Check the [CODEOWNERS](CODEOWNERS) file for areas of responsibility.
3. Open an issue to discuss your changes.
4. Submit a pull request with tests and documentation updates.

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).
