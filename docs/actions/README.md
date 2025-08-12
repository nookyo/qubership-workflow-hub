# Actions Index

Grouped by status: Active, Deprecated, Missing Documentation.

Legend: ✅ Active | ⚠ Deprecated | 📝 Documentation to be written

## ✅ Active
| Action | Purpose |
|--------|---------|
| [archive-and-upload-assets](../../actions/archive-and-upload-assets/README.md) | Archive folders/files and (optionally) upload as release assets |
| [assets-action](../../actions/assets-action/README.md) | Alternate path (mirrors archive-and-upload-assets) |
| [cdxgen](../../actions/cdxgen/README.md) | Generate SBOM + CycloneDX vuln report |
| [chart-version](../../actions/chart-version/README.md) | Update Helm Chart.yaml version fields |
| [container-package-cleanup](../../actions/container-package-cleanup/README.md) | Delete old container / Maven package versions |
| [custom-event](../../actions/custom-event/README.md) | Send repository_dispatch with payload |
| [docker-action](../../actions/docker-action/README.md) | Multi-platform Docker build & push |
| [helm-charts-release](../../actions/helm-charts-release/README.md) | Update images & publish Helm chart release |
| [maven-snapshot-deploy](../../actions/maven-snapshot-deploy/README.md) | Deploy Maven SNAPSHOT artifacts |
| [metadata-action](../../actions/metadata-action/README.md) | Compute versions, metadata, tags outputs |
| [poetry-publisher](../../actions/poetry-publisher/README.md) | Build/test/publish Python packages (Poetry) |
| [pr-add-messages](../../actions/pr-add-messages/README.md) | Append commit messages to PR body |
| [pr-assigner](../../actions/pr-assigner/README.md) | Auto-assign reviewers based on config / CODEOWNERS |
| [store-input-params](../../actions/store-input-params/README.md) | Store dispatch inputs as artifact |
| [tag-action](../../actions/tag-action/README.md) | Create/manage/delete Git tags with rules |
| [verify-json](../../actions/verify-json/README.md) | Validate JSON via schema |

## ⚠ Deprecated
| Action | Note / Replacement |
|--------|--------------------|
| [commit-and-push](../../actions/commit-and-push/README.md) | Use native git steps |
| [pom-updater](../../actions/pom-updater/README.md) | Prefer metadata-action + build tooling |
| [tag-checker](../../actions/tag-checker/README.md) | Use tag-action |

## 📝 Missing Documentation
| Action | Interim Description |
|--------|---------------------|
| [chart-release](../../actions/chart-release/action.yml) | Helm chart release helper (write README) |
| [chart-release-action](../../actions/chart-release-action/action.yml) | TS-based chart release logic (write README) |
| [maven-release](../../actions/maven-release/action.yaml) | Maven release script wrapper (write README) |

---
See also: [Conventions](../conventions.md) | [Reusable Workflows](../reusable/README.md) | [Guides](../NAVIGATION.md#guides)
