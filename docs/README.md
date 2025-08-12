# Qubership Workflow Hub

A comprehensive collection of reusable GitHub Actions and Workflows, designed to streamline your CI/CD pipelines and development processes.

## 🔍 Overview

### What this hub solves
Common CI/CD tasks (tagging, semantic / metadata version generation, artifact & package publishing, Helm chart release, cleanup, event triggering) are often re‑implemented inconsistently across repositories. This hub centralises those patterns so teams get:
* One vetted implementation instead of N ad‑hoc scripts
* Predictable inputs/outputs and error behaviour
* Pinned version strategy and upgrade path
* Reduced maintenance surface in product repositories

### Core components
| Component | Role | Location |
|-----------|------|----------|
| Actions | Single, composable steps (JS or composite) | `actions/<name>/` |
| Reusable workflows | Multi‑job orchestration via `workflow_call` | `docs/reusable/*.md` (docs) / `.github/workflows` (source when defined) |
| Conventions | Cross‑cutting rules (naming, security, versioning) | `docs/conventions.md` |
| Guides / Tutorials | Onboarding & process | `docs/*.md` |

### Principles
| Principle | Summary | Practical outcome |
|-----------|---------|-------------------|
| Determinism | Pin majors or SHAs | Reproducible builds |
| Least privilege | Start with `contents: read` only | Reduced token blast radius |
| Composability | Small, focused actions | Easier orchestration in workflows |
| Backwards compatibility | Major tag stable; break only with major bump | Safe incremental upgrades |
| Observability | Summaries & clear outputs | Quick diagnosis and audit trail |
| Explicit deprecation | Mark + replacement path | Predictable migration window |

### When to use what
| Need | Use an Action | Use a Reusable Workflow |
|------|---------------|-------------------------|
| One operation (tag, compute version, cleanup) | ✓ |  |
| Multi-step, multi-job orchestration (build + test + publish) |  | ✓ |
| Want to hide complexity behind a simple call | Possibly (if single job) | ✓ |
| Need to expose inputs/secrets/outputs contract to consumers | ✓ | ✓ |

### Versioning & deprecation (short form)
* Prefer `@v1` major (receives backward-compatible fixes) or full commit SHA for high-integrity steps.
* Deprecated components list a replacement; removal only after communicated grace period.

### Security baseline
* Minimal default permissions; elevate only per job requiring write.
* Dry-run & debug flags (where available) for safe trial.
* Encourage immutable references (SHAs) in critical release pipelines.

### Extending the hub
1. Draft a new action locally (composite or JS) under `actions/<name>/`.
2. Provide README (purpose, inputs, outputs, minimal example, failure modes).
3. Add to Actions index; add workflow docs if orchestration required.
4. Create `v1` tag and (optionally) publish SHA example for security-sensitive consumers.
5. Update conventions if introducing a new cross-cutting rule.

This structured approach keeps product repositories lean while providing a dependable automation toolkit.

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
