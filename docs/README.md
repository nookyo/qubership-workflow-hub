# Qubership Workflow Hub Documentation

Reusable GitHub Actions and reusable workflows to standardise tagging, releasing, packaging, metadata generation and related CI/CD tasks across repositories.

The goal: reduce duplicated pipeline logic, provide predictable building blocks, and enforce consistent security & versioning practices (pinning, least‑privilege permissions).

Who is this for: engineers integrating release automation, maintainers consolidating common workflows, and contributors adding new actions.

Out of scope: organisation‑specific business logic or per‑project build scripts (those stay in project repositories while consuming this hub).

---
## Quick Start
1. Read: [getting-started.md](getting-started.md)
2. Select an action: [../actions/README.md](../actions/README.md)
3. Pin version (`@v1` or full SHA) and integrate.

Minimal tagging example:
```yaml
steps:
  - uses: actions/checkout@v4

  - id: meta
    uses: nookyo/qubership-workflow-hub/actions/metadata-action@v1

  - uses: nookyo/qubership-workflow-hub/actions/tag-action@v1
    with:
      tag-name: "v${{ steps.meta.outputs.version }}"
```

---
## In this documentation

| Tutorials (learn) | How-to guides (tasks) |
|-------------------|-----------------------|
| [Getting Started](getting-started.md) – structure & first usage | Release draft: `reusable/release-drafter.md` |
| [Fork sequence](fork-sequence.md) – contribute safely | Python publish: `reusable/python-publish.md` |
|  | Maven publish: `reusable/maven-publish.md` |
|  | Broadcast files: `reusable/broadcast-files.md` |
|  | POM update (deprecated): `reusable/pom-updater.md` |
|  | Tag workflow (deprecated): `reusable/tag-creator.md` |

| Reference (specs) | Explanation (concepts) |
|-------------------|-----------------------|
| Actions catalog: [../actions/README.md](../actions/README.md) | Tagging strategy: see `tag-action` README |
| Reusable workflows: `reusable/*.md` | Version metadata approach: `metadata-action` README |
| Conventions: [conventions.md](conventions.md) | Fork model rationale: [fork-sequence.md](fork-sequence.md) |
| License: [../LICENSE](../LICENSE) | Maven POM prep: `maven-publish-pom-preparation_doc.md` |
| CLA: [../CLA/cla.md](../CLA/cla.md) | Maven secrets handling: `maven-publish-secrets_doc.md` |

---
## Conventions & Security
See: [conventions.md](conventions.md)

Version pinning:
```yaml
- uses: nookyo/qubership-workflow-hub/actions/tag-action@v1   # or @<SHA>
```
Permissions baseline:
```yaml
permissions:
	contents: read
# elevate to contents: write only when creating tags/releases
```

Dry runs: Prefer `dry-run: true` on first integration where supported.

---
## Contribution Workflow
1. Add or modify action under `actions/<name>/`.
2. Provide / update that action's README (purpose, inputs, outputs, example).
3. Update catalog: [../actions/README.md](../actions/README.md)
4. (If multi-job orchestration) document reusable workflow under `docs/reusable/`.
5. Pin & create `v1` (or update major tag). Optionally provide full SHA in examples.
6. Sign CLA: [../CLA/cla.md](../CLA/cla.md)

Issue tracker / feedback: open a GitHub Issue in this repository with a clear title (prefix with `docs:` or `action:` as appropriate).

---
## License
Apache 2.0 — [../LICENSE](../LICENSE)

---
Full navigation tree: [NAVIGATION.md](NAVIGATION.md)
