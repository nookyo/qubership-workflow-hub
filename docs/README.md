# Documentation Hub

Markdown-only documentation portal mirroring a MkDocs-style structure. Combine this page with the navigation helper for a cohesive browsing experience.

> See: [NAVIGATION.md](NAVIGATION.md) for a full hierarchical outline.

---

## Quick Links

| Area               | Link                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Actions Index      | [actions/README.md](actions/README.md)                                                                                                     |
| Reusable Workflows | [reusable/](reusable/)                                                                                                                     |
| Conventions        | [conventions.md](conventions.md)                                                                                                           |
| Guides             | [Fork Sequence](fork-sequence.md) · [Maven POM Prep](maven-publish-pom-preparation_doc.md) · [Maven Secrets](maven-publish-secrets_doc.md) |
| Examples           | [Release Drafter Config](examples/release-drafter-config.yml)                                                                              |
| Legal              | [CLA](../CLA/cla.md) · [License](../LICENSE)                                                                                               |

---

## Getting Started

See: [getting-started.md](getting-started.md) — repository structure, action examples, reusable workflow creation, permissions, GitHub Docs links.

---

## Structure Overview

1. Actions: Atomic automation components (tagging, cleanup, publishing, metadata).
2. Reusable Workflows: Higher-level orchestrations consumable via `workflow_call`.
3. Templates / Utility Workflows: Opinionated linting, labeling, formatting flows.
4. Guides: Deep-dive process documentation.
5. Conventions: Shared patterns (inputs, security, outputs, deprecations).

---

## Deprecated Map

| Legacy                    | Replacement                     |
| ------------------------- | ------------------------------- |
| docker-publish (workflow) | docker-action                   |
| tag-creator (workflow)    | tag-action                      |
| tag-checker               | tag-action                      |
| commit-and-push           | native git steps                |
| pom-updater               | metadata-action + build process |

---

## Contribution

Action READMEs remain canonical. Keep indices and navigation updated when adding or removing components.

---

## Internal Maintenance Checklist

| Task                             | Cadence       |
| -------------------------------- | ------------- |
| Validate links                   | Monthly       |
| Review deprecated list           | Release cycle |
| Sync new actions in index        | On merge      |
| Update guides for tooling shifts | Quarterly     |

---

Happy automating.
