# Documentation Hub

Markdown-only portal that mirrors a MkDocs-style navigation. This page gives a functional overview; deep lists live in dedicated index files to avoid duplication drift.

> Full tree: see [NAVIGATION.md](NAVIGATION.md)

---
## Quick Navigation
| Category | Purpose | Jump |
|----------|---------|------|
| Actions Index | Grouped list (Active / Deprecated / Missing Docs) | [actions/README.md](actions/README.md) |
| Reusable Workflows | Higher-level orchestrations | [reusable/](reusable/) |
| Conventions | Naming, inputs, security, versioning | [conventions.md](conventions.md) |
| Getting Started | Fast onboarding & examples | [getting-started.md](getting-started.md) |
| Guides | Process & deep dives | [Fork sequence](fork-sequence.md) · [Maven POM prep](maven-publish-pom-preparation_doc.md) · [Maven secrets](maven-publish-secrets_doc.md) |
| Examples | Reference configs | [Release Drafter config](examples/release-drafter-config.yml) |
| Legal | CLA & license | [CLA](../CLA/cla.md) · [License](../LICENSE) |

---
## Taxonomy
| Layer | Description | Where |
|-------|-------------|-------|
| Action | Atomic step (JS/composite) | `../actions/<name>/` |
| Reusable Workflow | Multi‑job orchestration (`workflow_call`) | `.github/workflows/*.yml` (source repo) |
| Guide | Process / explanation | `docs/*.md` |
| Convention | Shared rule / pattern | `conventions.md` |

Status categories are maintained in the Actions Index.

---
## Quick Usage Samples
Tag with computed version (metadata + tag):
```yaml
steps:
  - uses: actions/checkout@v4
  - id: meta
    uses: nookyo/qubership-workflow-hub/actions/metadata-action@v1
  - uses: nookyo/qubership-workflow-hub/actions/tag-action@v1
    with:
      tag-name: "v${{ steps.meta.outputs.version }}"
```
Consume reusable workflow:
```yaml
jobs:
  draft:
    uses: nookyo/qubership-workflow-hub/.github/workflows/release-drafter.yaml@v1
    with:
      config-file: .github/release-drafter.yml
```
Local composite action:
```yaml
steps:
  - uses: ./.github/actions/setup-env
```

See full guide: [getting-started.md](getting-started.md)

---
## Versioning
Use `@v1` (major tag) or a full commit SHA. Avoid floating `@main`. Major increments only on breaking changes. Deprecated items are mapped in index; plan migration before removal.

---
## Security Snapshot
Start with least privileges:
```yaml
permissions:
  contents: read
```
Grant `contents: write` only for tagging / release steps; prefer OIDC (`id-token: write`) over long‑lived secrets.

---
## Contribution Workflow
1. Add / modify action or workflow.
2. Document (README for action, update indexes).
3. Add tests / smoke workflow.
4. Pin & tag (`v1` or SHA).
5. Open PR referencing related issue (if any).
6. Pass quality gates (lint, security review, docs completeness).

CLA: [../CLA/cla.md](../CLA/cla.md) | Ownership: [../CODEOWNERS](../CODEOWNERS)

---
## Maintenance Cadence
| Task | Frequency |
|------|-----------|
| Link validation | Monthly |
| Deprecation review | Release cycle |
| Index sync (actions/workflows) | Each merge adding/removing items |
| Permissions audit | Quarterly |
| Guide refresh | Quarterly |

---
Happy automating. 🚀
