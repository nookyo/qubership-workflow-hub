# 🚀 GitHub Metadata Action

This **GitHub Metadata** GitHub Action extracts metadata from the current GitHub context and generates a version string based on templates and tags.

## Features

- Extracts metadata from the current GitHub context.
- Generates a version string based on templates and tags.
- Supports custom templates and configuration files.

## 📌 Inputs

| Name                 | Description                    | Required | Default                                |
| -------------------- | ------------------------------ | -------- | -------------------------------------- |
| `ref`                | Current branch or tag ref      | No       |                                        |
| `configuration-path` | Path to the configuration file | No       | `./.github/metadata-action-config.yml` |

## 📌 Outputs

| Name        | Description                     |
| ----------- | ------------------------------- |
| `result`    | Rendered template with metadata |
| `ref`       | Current branch or tag ref       |
| `ref-name`  | Current branch or tag name      |
| `date`      | Current date                    |
| `time`      | Current time                    |
| `timestamp` | Current timestamp               |
| `dist-tag`  | Current tag                     |
| `major`     | Major version                   |
| `minor`     | Minor version                   |
| `patch`     | Patch version                   |

## Metadata Description

The metadata extracted by this action includes the following:

- **ref**: The current branch or tag reference.
- **ref-name**: The name of the current branch or tag.
- **date**: The current date in `YYYYMMDD` format.
- **time**: The current time in `HHMMSS` format.
- **timestamp**: The current timestamp in `YYYYMMDDHHMMSS` format.
- **dist-tag**: The distribution tag based on the branch or tag.
- **major**: The major version part of the semantic version.
- **minor**: The minor version part of the semantic version.
- **patch**: The patch version part of the semantic version.

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
          configuration-path: "./.github/metadata-action-config.yml"
```

## Configuration File

The configuration file (metadata-action-config.yml) should define the templates and distribution tags used by the action. Here is an example configuration:

```yaml
branches-template:
  - main: "Main branch template"
  - "feature/*": "Feature branch template"
  - "release/*": "Release branch template"
  - tag: "Tag template"

dist-tags:
  - main: "latest"
  - "release/*": "next"
  - "feature/*": "beta"
  - tag: "stable"
```

## Template Example

Here is an example of a template that can be used in the configuration file:

```yaml
branches-template:
  - main: "v{{major}}.{{minor}}.{{patch}}-{{date}}"
  - "feature/*": "feature-{{ref-name}}-{{timestamp}}"
  - "release/*": "release-{{ref-name}}-{{timestamp}}.{{dist-tag}}"
  - tag: "v{{major}}.{{minor}}.{{patch}}"
```

In this example:

- The main branch template generates a version string in the format vMAJOR.MINOR.PATCH-DATE.
- The feature/\* branch template generates a version string in the format feature-BRANCH_NAME-TIMESTAMP.
- The release/\* branch template generates a version string in the format release-BRANCH_NAME-TIMESTAMP.DIST-TAG.
- The tag template generates a version string in the format vMAJOR.MINOR.PATCH.
