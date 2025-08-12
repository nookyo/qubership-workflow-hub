# Documentation Hub

Curated hub of reusable GitHub Actions and reusable workflows for tagging, releasing, packaging, metadata generation, chart management and more — all documented with plain Markdown (no static site generator required).

> Full navigation tree: see [NAVIGATION.md](NAVIGATION.md)

---

## Quick Navigation

| Category           | Purpose                                                           | Jump                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Actions Index      | List of all actions (grouped: Active / Deprecated / Missing Docs) | [actions/README.md](actions/README.md)                                                                                                     |
| Reusable Workflows | Higher‑level orchestrations                                       | [reusable/](reusable/)                                                                                                                     |
| Conventions        | Naming, inputs, version pinning, security                         | [conventions.md](conventions.md)                                                                                                           |
| Getting Started    | Fast onboarding & examples                                        | [getting-started.md](getting-started.md)                                                                                                   |
| Guides             | Process & deep dives                                              | [Fork Sequence](fork-sequence.md) · [Maven POM Prep](maven-publish-pom-preparation_doc.md) · [Maven Secrets](maven-publish-secrets_doc.md) |
| Examples           | Reference configs & snippets                                      | [Release Drafter Config](examples/release-drafter-config.yml)                                                                              |
| Legal              | CLA & license                                                     | [CLA](../CLA/cla.md) · [License](../LICENSE)                                                                                               |

---

## Why this hub exists

Centralize shared automation so every repo does NOT reinvent tagging, version metadata, artifact publishing, or chart release logic. You: consume & pin versions. We: evolve behind stable major tags.

---

## Taxonomy

| Layer             | Description                                 | Example                |
| ----------------- | ------------------------------------------- | ---------------------- |
| Action            | Atomic, one job step (JS / composite)       | `tag-action`           |
| Reusable Workflow | Multi‑job orchestration via `workflow_call` | `release-drafter.yaml` |
| Guide             | Human process knowledge                     | `fork-sequence.md`     |
| Convention        | Cross‑cutting standard / rule               | `conventions.md`       |

Status categories (see index): Active (supported) / Deprecated (avoid, will be removed) / Missing Documentation (needs README before broad adoption).

---

## 30‑Second Usage Examples

Action (tagging):

```yaml
steps:
	- uses: actions/checkout@v4
	- uses: nookyo/qubership-workflow-hub/actions/tag-action@v1
		with:
			tag-name: v1.2.3
```

Reusable workflow (release drafter):

```yaml
jobs:
	draft:
		uses: nookyo/qubership-workflow-hub/.github/workflows/release-drafter.yaml@v1
		with:
			config-file: .github/release-drafter.yml
```

Local composite action consumption:

```yaml
steps:
	- uses: ./.github/actions/setup-env
```

Need more context? Jump to the full [Getting Started](getting-started.md).

---

## 🏷 Versioning & Stability

| Practice                                | Rationale                                          |
| --------------------------------------- | -------------------------------------------------- |
| Pin to `@v1` (major tag)                | Stable contract, receive backward compatible fixes |
| Pin to full SHA for critical paths      | Supply‑chain integrity / deterministic builds      |
| Avoid floating refs (`@main`)           | Prevent surprise breakage                          |
| Increment major only on breaking change | Predictability                                     |

Deprecation flow: mark in index → add replacement → soft grace period → archive.

---

## 🛠 Contribute a New Action (Checklist)

1. Scaffold folder under `actions/<new-action>/` with `action.yml`.
2. Implement logic (`index.js` for JS action or composite steps for composite action).
3. Add a focused README (inputs, outputs, minimal examples, edge cases, versioning notes).
4. Add usage example to `docs/actions/README.md` in Active section.
5. Add any new conventions (if cross‑cutting) to `conventions.md`.
6. Create a smoke workflow under `.github/workflows/` validating key scenarios.
7. Tag initial release `v1` (or update major symlink tag pointing to current SHA).
8. (Optional) Add tests / contract assertions (dry‑run, error paths).

PR quality gates (see below) must be green before merge.

---

## 🧪 Recommended Quality Gates

| Gate                      | Tooling Idea                       | Target                    |
| ------------------------- | ---------------------------------- | ------------------------- |
| Lint / Format             | ESLint / Prettier (JS actions)     | No errors                 |
| Shell safety              | `shellcheck` (if shell scripts)    | 0 warnings (or justified) |
| Unit / Smoke              | Minimal workflow invocation        | Pass                      |
| Security                  | Pin external actions; review diffs | All pinned                |
| Docs                      | Inputs / outputs documented        | Complete                  |
| Changelog / Release notes | Release drafter / manual summary   | Updated                   |

---

## ♻️ Common Scenarios

| Task                         | Use                            | Notes                                               |
| ---------------------------- | ------------------------------ | --------------------------------------------------- |
| Create semantic tag          | `tag-action`                   | Combine with `metadata-action` for computed version |
| Publish build metadata       | `metadata-action`              | Supplies version for downstream steps               |
| Upload build artifacts       | `archive-and-upload-assets`    | Supports grouping & retention                       |
| Publish Helm charts          | `helm-charts-release` workflow | Ensure chart version bump first                     |
| Clean old container packages | `container-package-cleanup`    | Run on schedule with least permissions              |

---

## 🗺 Deprecated Map

| Legacy                    | Replacement             | Notes                        |
| ------------------------- | ----------------------- | ---------------------------- |
| docker-publish (workflow) | docker-action           | Unified build+push           |
| tag-creator (workflow)    | tag-action              | Consolidated tagging logic   |
| tag-checker               | tag-action              | Checker integrated           |
| commit-and-push           | native git steps        | Simpler & transparent        |
| pom-updater               | metadata-action + build | More generic metadata source |

---

## 🔐 Security & Permissions Snapshot

Follow least privilege: start with `permissions: { contents: read }` and elevate only per job needing write (tag, release, package publish). Prefer OIDC (`id-token: write`) over long‑lived secrets for cloud auth.

---

## 🧭 Maintenance Cadence

| Task                                 | Cadence            | Owner (TBD) |
| ------------------------------------ | ------------------ | ----------- |
| Validate internal/relative links     | Monthly            |             |
| Review deprecated list & sunset plan | Each release cycle |             |
| Sync new actions into index          | On merge           |             |
| Audit permission scopes              | Quarterly          |             |
| Refresh guides for ecosystem changes | Quarterly          |             |

---

## 🤝 Contribution Notes

Action READMEs are canonical. Keep this hub DRY: link instead of duplicating long explanations. Small, incremental PRs preferred. If adding a breaking change, coordinate a major tag update and clearly annotate the old tag.

---

Happy automating. Ship confidently. 🚀
