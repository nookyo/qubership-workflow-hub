# Action & Workflow Conventions

Goal: make usage of actions and reusable workflows predictable, secure, and easy to audit.

What are "conventions" here? They are shared rules and agreed best practices that every action and reusable workflow in this hub MUST or SHOULD follow so that code stays consistent and easy to maintain.

Normative keywords legend:
| Keyword | Strength | Meaning |
|---------|----------|---------|
| MUST | Mandatory | Required for correctness / security |
| SHOULD | Strongly recommended | Deviation only with documented rationale |
| MAY | Optional | Use if it helps your scenario |

Bug / issue reporting: This document ALSO tells you exactly how to file bugs and request enhancements (see Section 12: Support / Issue Reporting). Always check here first before opening an issue.

Use this page when: designing a new action/workflow, reviewing a PR, preparing a release, or filing a bug.

---

## Table of Contents

- [Action \& Workflow Conventions](#action--workflow-conventions)
  - [Table of Contents](#table-of-contents)
  - [1. Quick Reference](#1-quick-reference)
  - [2. Common Inputs (Standard Names)](#2-common-inputs-standard-names)
  - [3. Version Pinning](#3-version-pinning)
  - [4. Patterns \& Wildcards](#4-patterns--wildcards)
  - [5. Outputs](#5-outputs)
  - [6. Security \& Permissions](#6-security--permissions)
  - [7. Step Summaries](#7-step-summaries)
  - [8. Deprecation Policy](#8-deprecation-policy)
  - [9. Caching \& Performance](#9-caching--performance)
  - [10. Reproducibility Checklist](#10-reproducibility-checklist)
  - [11. Creating a New Action (Micro Checklist)](#11-creating-a-new-action-micro-checklist)
  - [12. Support / Issue Reporting (How to File Bugs)](#12-support--issue-reporting-how-to-file-bugs)
  - [13. Quick Review Checklist (PR Gate)](#13-quick-review-checklist-pr-gate)

---

## 1. Quick Reference

| Topic           | Rule (TL;DR)                                                        |
| --------------- | ------------------------------------------------------------------- |
| Version pinning | Use `@v1` or full commit SHA; never `@main` in production           |
| Permissions     | Start with `contents: read`; elevate minimally per job              |
| Inputs naming   | kebab-case or lower-case with dashes; avoid ambiguous abbreviations |
| Outputs naming  | lower-case with dashes (e.g. `image-digest`, `version`)             |
| Dry run         | Provide `dry-run: true` flag where destructive side-effects occur   |
| Debug           | Provide `debug: true` to expand logging; never print secrets        |
| Deprecation     | Mark in map + provide replacement; keep for grace period            |
| Reproducibility | Pin external actions & document strategy in README                  |

---

## 2. Common Inputs (Standard Names)

| Input                                | Purpose                                  | Example                            |
| ------------------------------------ | ---------------------------------------- | ---------------------------------- |
| `dry-run`                            | Simulate execution (no write operations) | Cleanup listing images only        |
| `debug`                              | Verbose logs / extra summaries           | Printing derived version parts     |
| `ref`                                | Checkout a specific branch / tag         | Tag creation on `release/*` branch |
| `config-file` / `configuration-path` | Load external configuration              | `.github/my-config.yml`            |
| `version-strategy`                   | Select version derivation mode           | `auto`, `calendar`, `file`         |
| `force-create`                       | Override existing tag / resource         | Tag recreation scenario            |

Consistency: prefer one canonical spelling. If legacy name exists, keep it but document preferred alias.

---

## 3. Version Pinning

Why: avoid breaking changes & supply‑chain risk.

| Pin Style         | Example                            | Use When                              |
| ----------------- | ---------------------------------- | ------------------------------------- |
| Major tag         | `uses: repo/action@v1`             | General consumption, expect bug fixes |
| Full SHA          | `uses: repo/action@3f5c2ab...`     | Security‑critical (release, signing)  |
| Hybrid (doc both) | Code pins SHA + README shows `@v1` | Teams need auto docs + strict runtime |

Avoid floating refs:

```yaml
# Bad
- uses: repo/action@main
```

---

## 4. Patterns & Wildcards

Some actions accept shell wildcards (`*`, `?`) for matching tags, files, image names. Examples:

- `*SNAPSHOT*` – match Maven snapshot versions
- `v1.*` – match all patch releases under major.minor

Clarify supported glob syntax in action README if used.

---

## 5. Outputs

Expose only stable, necessary data. Naming guidelines:

- Use nouns (`version`, `created-tag`, `summary`)
- Avoid tense (`created` over `hasCreated` or `isCreated`)
- Document each output with a one-line meaning + example value

Access pattern:

```yaml
steps:
  - id: meta
    uses: repo/metadata-action@v1
  - run: echo "Version=${{ steps.meta.outputs.version }}"
```

---

## 6. Security & Permissions

Principles:

1. Least privilege first.
2. Isolate write operations into dedicated jobs with explicit permissions.
3. Prefer OIDC (`id-token: write`) over long‑lived cloud credentials.

Baseline snippet:

```yaml
permissions:
  contents: read
```

Elevate only where needed:

```yaml
permissions:
  contents: write # e.g. tag/release job
  packages: write # publishing artifacts
```

Never echo secrets. Use `${{ secrets.NAME }}` only in environment or inputs. Avoid logging transformed secrets (hashes can still leak patterns).

---

## 7. Step Summaries

Prefer concise Markdown appended to `$GITHUB_STEP_SUMMARY` for:

- Version / tag chosen
- Deleted resources (cleanup)
- Key outputs (image digest)

Keep machine‑parsable data in outputs, human narrative in summary.

---

## 8. Deprecation Policy

| Stage            | Indicator                   | Action Required                           |
| ---------------- | --------------------------- | ----------------------------------------- |
| Active           | Listed w/o note             | Normal use                                |
| Deprecated       | Marked in map + README note | Migrate to replacement                    |
| Sunset Scheduled | Dated removal notice        | Final migration; avoid new usage          |
| Removed          | Archive / folder frozen     | Replace usage; pin old SHA if must retain |

Current map:
| Legacy | Replacement |
|--------|-------------|
| docker-publish (workflow) | docker-action |
| tag-creator (workflow) | tag-action |
| tag-checker | tag-action |
| commit-and-push | Inline git steps |
| pom-updater | metadata-action + build tooling |

---

## 9. Caching & Performance

Caching is opt‑in per consumer repo. Rationale: keep hub components generic. Add `actions/cache` usage in downstream workflows (e.g. Node modules, pip cache, Maven local repo) rather than baking into actions unless universally applicable.

---

## 10. Reproducibility Checklist

| Item                                    | Why                   |
| --------------------------------------- | --------------------- |
| Pin hub actions                         | Avoid silent drift    |
| Pin third‑party actions                 | Supply chain control  |
| Avoid unbounded globs (prefer explicit) | Predictable file sets |
| Document version logic                  | Audit & debug clarity |
| Use dry-run in first integration        | Safe validation       |

---

## 11. Creating a New Action (Micro Checklist)

1. Folder: `actions/<name>/` with `action.yml`.
2. Decide composite vs JS (JS if complex logic / external libs needed).
3. Inputs: minimal, documented, defaults where safe.
4. Outputs: only stable values.
5. Add README: purpose, inputs table, outputs table, minimal example, error modes.
6. Add smoke workflow in hub or consuming project.
7. Tag initial `v1` (and optionally pin SHA in examples).
8. Update indexes / deprecation map if relevant.

---

## 12. Support / Issue Reporting (How to File Bugs)

When opening a bug or feature request, include:

- Action/workflow name + version (tag or SHA)
- Workflow excerpt (minimal reproducible snippet)
- Observed vs expected behaviour
- Relevant log lines (redact secrets)
- Environment specifics (runner OS, matrix values)

Bug triage process (internal):

1. Reproduce with provided snippet (MUST be reproducible or request more info).
2. Label with `bug`, `enhancement`, or `question`.
3. Link related deprecation / security items if relevant.
4. Decide fix scope & milestone.
5. Close with clear resolution note (fixed / wontfix / invalid / duplicate).

If security-sensitive, DO NOT open a public issue—follow the private disclosure channel (see repository security policy if present) or contact maintainers directly.

---

## 13. Quick Review Checklist (PR Gate)

| Check                                      | Done |
| ------------------------------------------ | ---- |
| Inputs minimal & named clearly             |      |
| Outputs documented                         |      |
| Version pin examples use `@v1` or SHA      |      |
| Permissions minimal                        |      |
| Dry-run & debug supported (if destructive) |      |
| README added / updated                     |      |
| Added to actions index                     |      |
| Deprecations map updated (if needed)       |      |

---

Clear, consistent conventions keep the hub maintainable and safe.
