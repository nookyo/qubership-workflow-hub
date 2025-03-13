# 🚀 GitHub Metadata Action

This **GitHub Metadata** GitHub Action extracts metadata from the current GitHub context and generates a version string based on templates and tags.

## Features

- Extracts metadata from the current GitHub context.
- Generates a version string based on templates and tags.
- Supports custom templates and configuration files.

## 📌 Inputs

| Name                 | Description                              | Required | Default                                               |
| -------------------- | ---------------------------------------- | -------- | ----------------------------------------------------- |
| `ref`                | Branch or tag ref                        | No       | `github.context.ref`                                  |
| `configuration-path` | Path to the configuration file           | No       | `./.github/metadata-action-config.yml`                |

## 📌 Outputs

| Name        | Description                                                                                                                                   | Example                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `result`    | Rendered template with metadata based on template rules (e.g. using `v{{major}}.{{minor}}.{{patch}}-{{date}}` for the main branch).             | v1.2.3-20250313             |
| `ref`       | The current branch or tag reference (e.g. `refs/heads/main`).                                                                                 | refs/heads/main             |
| `ref-name`  | The name of the current branch or tag.                                                                                                        | main                        |
| `date`      | Current date in `YYYYMMDD` format.                                                                                                            | 20250313                    |
| `time`      | Current time in `HHMMSS` format.                                                                                                              | 235959                      |
| `timestamp` | Combined date and time in `YYYYMMDDHHMMSS` format.                                                                                            | 20250313235959              |
| `dist-tag`  | Distribution tag based on the branch or tag (e.g. `latest` for main, `beta` for feature branches).                                               | latest                      |
| `major`     | Major version number extracted from semantic versioning.                                                                                    | 1                           |
| `minor`     | Minor version number extracted from semantic versioning.                                                                                    | 2                           |
| `patch`     | Patch version number extracted from semantic versioning.                                                                                    | 3                           |

## Usage Example

Below is an example of how to use this action in a GitHub Actions workflow:

```yaml
name: Extract Metadata

on:
  push:
    branches:
      - main

jobs:
  extract-metadata:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Metadata
        uses: Netcracker/qubership-workflow-hub/actions/metadata-action@main
        with:
          configuration-path: './.github/metadata-action-config.yml'
```

## Configuration File

The configuration file (metadata-action-config.yml) should define the templates and distribution tags used by the action. Here is an example configuration:

```yaml
 branches-template:
  - main: "v{{major}}.{{minor}}.{{patch}}-{{date}}"
  - "feature/*": "feature-{{ref-name}}-{{timestamp}}.{{dis-tag}}"
  - "release/*": "release-{{ref-name}}-{{timestamp}}.{{dist-tag}}"
  - tag: "v{{major}}.{{minor}}.{{patch}}"

dist-tags:
  - main: "latest"
  - "release/*": "next"
  - "feature/*": "beta"
  - tag: "stable"
```

In this example:

- **Main branch template:** generates a version string in the format `vMAJOR.MINOR.PATCH-DATE` (e.g. `v1.2.3-20250313`).
- **Feature/* branch template:** generates a version string in the format `feature-BRANCH_NAME-TIMESTAMP` (e.g. `feature-my-feature.beta-20250313235959.beta`).
- **Release/* branch template:** generates a version string in the format `release-BRANCH_NAME-TIMESTAMP.DIST-TAG` (e.g. `release-v1.2.3-20250313235959.next`).
- **Tag template:** generates a version string in the format `vMAJOR.MINOR.PATCH` (e.g. `v1.2.3`).

## Additional Information

### GitHub Context Availability

The GitHub context is available, allowing you to access properties such as the current branch, tag, and other metadata. This context can be used within the action to dynamically generate version strings and tailor behavior based on the repository state.
More information here:


### Semantic Version Parsing Contract

The variables `major`, `minor`, and `patch` are parsed only from a branch or tag that follows the format `vMAJOR.MINOR.PATCH` (for example, `v1.0.1`). This format is a strict contract; only tags or branch names matching this pattern will be correctly parsed to extract the semantic version components.