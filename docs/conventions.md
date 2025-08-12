# Action & Workflow Conventions

RU: Коротко — единые правила: как называем inputs/outputs, чем пинним версии, какие права даём, как помечаем deprecated и как заводим баги.
EN: Rules for naming, version pinning, permissions, deprecation and bug reporting.

Legend: MUST = required, SHOULD = recommended, MAY = optional.

Bug template: section 9 (always include action version + minimal workflow snippet).

---

## Sections

1. Quick Rules
2. Standard Inputs
3. Version Pinning
4. Outputs
5. Security
6. Deprecation
7. New Action Checklist
8. PR Review Checklist
9. Bug / Issue Reporting

---

## 1. Quick Rules

| Area        | MUST / SHOULD                                                   |
| ----------- | --------------------------------------------------------------- |
| Versions    | MUST use `@v1` (major) or SHA. No `@main` in prod.              |
| Permissions | MUST start minimal (`contents: read`). Elevate only where used. |
| Inputs      | SHOULD kebab-case (`dry-run`).                                  |
| Outputs     | SHOULD short nouns (`version`).                                 |
| Dry run     | SHOULD offer `dry-run` for destructive steps.                   |
| Debug       | MAY add `debug` (no secrets).                                   |
| Secrets     | MUST never echo / partially mask.                               |
| Deprecation | MUST list replacement before removal.                           |

---

## 2. Standard Inputs

| Input              | Meaning                                     |
| ------------------ | ------------------------------------------- |
| `dry-run`          | Simulate (no writes)                        |
| `debug`            | Verbose logs                                |
| `ref`              | Override branch/tag                         |
| `config-file`      | External config path                        |
| `version-strategy` | Version mode (`auto` / `calendar` / `file`) |
| `force-create`     | Overwrite existing tag/resource             |

One spelling per concept; keep legacy alias only if needed.

---

## 3. Version Pinning

MUST pin to major tag or SHA. Critical flows: prefer SHA. Bad: `uses: repo/action@main`.

---

## 4. Outputs

Use stable nouns only. Example:

```yaml
steps:
  - id: meta
    uses: repo/metadata-action@v1
  - run: echo Version=${{ steps.meta.outputs.version }}
```

---

## 5. Security

Baseline:

```yaml
permissions:
  contents: read
```

Add only what you need (e.g. `contents: write`, `packages: write`). Prefer OIDC. No secret echoing.

---

## 6. Deprecation

Stages: Active → Deprecated (announce + replacement) → Sunset (deadline) → Removed.
Current map:
| Old | Replacement |
|-----|-------------|
| docker-publish (workflow) | docker-action |
| tag-creator (workflow) | tag-action |
| tag-checker | tag-action |
| commit-and-push | inline git steps |
| pom-updater | metadata-action + build tooling |

## 7. New Action Checklist

1. Folder + `action.yml`
2. Minimal inputs
3. Stable outputs
4. README (purpose/inputs/outputs/example)
5. Smoke workflow
6. Tag `v1`
7. Add to index/map

## 8. PR Review Checklist

| Item                        | OK? |
| --------------------------- | --- |
| Inputs minimal + kebab-case |     |
| Outputs documented          |     |
| Version pin correct         |     |
| Permissions minimal         |     |
| Dry-run (if destructive)    |     |
| README updated              |     |
| Deprecation map updated     |     |

## 9. Bug / Issue Reporting

Include: name + version, minimal snippet, expected vs actual, key logs (no secrets), runner OS. Security issue → private channel.

— End —
