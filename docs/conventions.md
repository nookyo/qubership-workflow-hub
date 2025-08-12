# Action & Workflow Conventions

This page centralizes recurring patterns across actions and reusable workflows.

## Common Inputs
| Input | Typical Purpose |
|-------|-----------------|
| `dry-run` | Simulate behavior without side effects |
| `debug` | Increase log verbosity |
| `ref` | Override the working Git ref (tag/branch) |
| `config-path` / `configuration-path` | External YAML / JSON configuration |

## Version Pinning
Prefer using a major tag (e.g. `@v1`) or a commit SHA for stability. Avoid `@main` in production workflows unless you track upstream changes closely.

## Wildcards & Patterns
Some actions (e.g. cleanup, metadata) support shell-style wildcards:
* `*` any sequence
* `?` single character
Special examples: `*SNAPSHOT*` (Maven snapshot detection).

## Outputs Usage
Consume outputs via `steps.<id>.outputs.<name>`. Check each action README for its export list (e.g. version, tag, image digest, report paths).

## Security Guidelines
- Grant minimum token scopes (e.g. `contents: write`, `packages: write` only when needed).
- Never print secrets; rely on masked environment variables / inputs.
- Use organization-level secrets for shared credentials.

## Deprecations Map
| Legacy | Replacement |
|--------|-------------|
| docker-publish (workflow) | docker-action |
| tag-creator (workflow) | tag-action |
| tag-checker | tag-action |
| commit-and-push | direct git commands within a job |
| pom-updater (where feasible) | metadata-action + build tooling |

## Step Summaries
Some actions append human-readable summaries (cleanup results, metadata). View them in the GitHub Actions run Summary tab.

## Caching & Performance
Reusable workflows typically lean on ecosystem defaults (e.g. `actions/setup-node`, `actions/setup-python`)—add caching steps explicitly in downstream usage where needed.

## Reproducibility
Pin external actions (including those from this repo) to immutable references for auditability.

## Support
Open issues with a clear title, context (workflow excerpt), and logs (redacting secrets). Attach your effective input configuration and referenced ref.
