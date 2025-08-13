# Actions Index

Concise catalog of available actions with primary purpose. Refer to each action's own README (if present) or `action.yml` for full inputs/outputs. Grouped alphabetically.

| Action                    | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| archive-and-upload-assets | Archive build artifacts and optionally upload as release assets                    |
| assets-action             | Alternate archiving / asset upload path (mirrors above)                            |
| cdxgen                    | Generate Software Bill of Materials (SBOM) and CycloneDX vulnerability report      |
| chart-release             | Helm chart release helper (documentation pending)                                  |
| chart-release-action      | TypeScript-based chart release logic (documentation pending)                       |
| chart-version             | Update Helm Chart.yaml version fields                                              |
| commit-and-push           | Commit and push repository changes (consider native git steps)                     |
| container-package-cleanup | Remove stale container/Maven package versions per retention rules                  |
| custom-event              | Emit a repository_dispatch custom event with payload                               |
| docker-action             | Build and push (multi-platform) Docker images                                      |
| helm-charts-release       | Update images & publish Helm chart release                                         |
| maven-release             | Perform Maven release process (documentation pending)                              |
| maven-snapshot-deploy     | Deploy Maven SNAPSHOT artifacts to repository                                      |
| metadata-action           | Produce version and tagging metadata outputs                                       |
| poetry-publisher          | Build, test and publish Python packages using Poetry                               |
| pom-updater               | Update Maven POM versions (deprecated in favor of metadata-action + build tooling) |
| pr-add-messages           | Append commit messages to an open PR description                                   |
| pr-assigner               | Auto-assign PR reviewers based on configuration / CODEOWNERS                       |
| store-input-params        | Persist workflow_dispatch inputs as an artifact                                    |
| tag-action                | Create / delete / check git tags; optional release creation                        |
| tag-checker               | Legacy tag validation (use tag-action)                                             |
| verify-json               | Validate JSON files against a schema                                               |

Status markers:

- (documentation pending) – README not yet authored.
- (deprecated) – Avoid in new workflows; migrate to noted alternative.

Planned enhancements: generated inputs/outputs table, required permissions matrix.
