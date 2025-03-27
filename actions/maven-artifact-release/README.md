# Maven Artifact Release Action

This GitHub Action automates the release process for Maven artifact. It handles versioning, tagging, and deployment to a Maven repository.

## Inputs

### `version-type`

**Required**  
The part of the sem-ver version. Can be one of `major`, `minor`, `patch`. `patch` is the default.

### `module`

**Required**  
The name of the repository which artifact should be released.

### `token`

**Required**  
The name of the secret which conteins Fine-grained token which has next repository permissions:

- Read access to metadata
- Read and Write access to actions and code

## Example Usage

```yaml
name: Release Maven Module

on:
  workflow_dispatch: {}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Release Maven Artifact
        uses: netcracker/qubership-workflow-hub/actions/maven-artifact-release@main
        with:
          module: 'my-module'
          version-type: 'patch'
          token: ${{ secrets.MVN_RELEASE_TOKEN }}
```
