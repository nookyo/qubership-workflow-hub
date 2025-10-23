# Application Manifest Generation

GitHub Action for generating application manifests using the `qubership-app-manifest-cli`.

This composite action checks out the `qubership-app-manifest-cli` tool, sets up a Python environment, installs the CLI, and generates an application manifest based on your configuration and optional parameters. The resulting manifest is uploaded as a workflow artifact.

---

## Inputs

| Name                | Required | Type   | Default     | Description |
|---------------------|----------|--------|-------------|-------------|
| `configuration`     | Yes      | string |                       | Path to the configuration file for manifest generation |
| `output`            | No       | string | `name`-`version`.json | Output file path for the generated manifest |
| `version`           | No       | string |                       | Version to set in the application manifest |
| `name`              | No       | string |  Will be set from configuration file  | Name to set in the application manifest |
| `meta-data-files`   | No       | string |                       | Space-separated list of additional metadata files to include |
| `cli-version`       | No       | string | `main`                | Branch, tag, or commit of `qubership-app-manifest-cli` to use |

---

## Outputs

| Name                  | Description |
|-----------------------|-------------|
| `app-manifest-path`       | Path to the generated application manifest file |

---

## Usage Example

```yaml
---
name: Build Artifacts

on:
  workflow_dispatch:

jobs:
  multiplatform_build:
    strategy:
      fail-fast: false
      matrix:
        component:
        - name: jaeger-integration-tests
          file: integration-tests/Dockerfile
          context: integration-tests
        - name: jaeger-readiness-probe
          file: readiness-probe/Dockerfile
          context: readiness-probe
        - name: jaeger-transfer
          file: docker-transfer/Dockerfile
          context: "."
    runs-on: ubuntu-latest
    name: ${{ matrix.component.name }}
    steps:
    - name: Build ${{ matrix.component.name }}
      uses: netcracker/qubership-workflow-hub/actions/docker-action@v2.0.1
      with:
        ref: ${{ github.event.ref }}
        component: ${{ toJson(matrix.component) }}$

  app-manifest-build:
    runs-on: ubuntu-latest
    needs: [multiplatform_build]
    steps:
    - name: Download metadata
      uses: actions/download-artifact@v5
      with:
        path: "./cli/meta-data-files"
        merge-multiple: true
        pattern: "*.json"

    - name: Collect metadata files
      run: |
        meta_data_files=""
        for file in ./cli/meta-data-files/*.json; do
          meta_data_files="$meta_data_files $file"
        done
        echo "[DEBUG] Metadata files: ${meta_data_files}"
        echo "META_DATA_FILES=${meta_data_files}" >> $GITHUB_ENV

    - name: Generate AM
      id: generate_am
      uses: netcracker/qubership-workflow-hub/actions/app-manifest@main
      with:
        configuration: ./.github/qubership-jaeger-am-build.yaml
        version: ${{ inputs.version }}
        meta-data-files: ${{ env.META_DATA_FILES }}
        cli-version: main
```

## Configuration example

```yaml
applicationVersion: 1.2.3
applicationName: jaeger
components:
  - name: jaeger
    mimeType: application/vnd.qubership.standalone-runnable
    dependsOn:
      - name: qubership-jaeger
        mimeType: application/vnd.qubership.helm.chart
  - name: qubership-jaeger
    mimeType: application/vnd.qubership.helm.chart
    dependsOn:
      - name: jaeger-cassandra-schema
        mimeType: application/vnd.docker.image
        valuesPathPrefix: cassandraSchema
      - name: jaeger
        mimeType: application/vnd.docker.image
        valuesPathPrefix: jaeger
      - name: jaeger-readiness-probe
        mimeType: application/vnd.docker.image
        valuesPathPrefix: readinessProbe
      - name: example-hotrod
        mimeType: application/vnd.docker.image
        valuesPathPrefix: exampleHotrod
      - name: jaeger-integration-tests
        mimeType: application/vnd.docker.image
        valuesPathPrefix: integrationTests
      - name: jaeger-es-index-cleaner
        mimeType: application/vnd.docker.image
        valuesPathPrefix: elasticsearch.indexCleaner
      - name: jaeger-es-rollover
        mimeType: application/vnd.docker.image
        valuesPathPrefix: elasticsearch.rollover
      - name: envoy
        mimeType: application/vnd.docker.image
        valuesPathPrefix: proxy
      - name: openjdk
        mimeType: application/vnd.docker.image
        valuesPathPrefix: .
      - name: spark-dependencies-image
        mimeType: application/vnd.docker.image
        valuesPathPrefix: spark
      - name: qubership-deployment-status-provisioner
        mimeType: application/vnd.docker.image
        valuesPathPrefix: statusProvisioner
  - name: jaeger-cassandra-schema
    mimeType: application/vnd.docker.image
    reference: docker.io/jaegertracing/jaeger-cassandra-schema:1.72.0
  - name: jaeger
    mimeType: application/vnd.docker.image
    reference: docker.io/jaegertracing/jaeger:2.9.0
  - name: jaeger-readiness-probe
    mimeType: application/vnd.docker.image
    reference: ghcr.io/netcracker/jaeger-readiness-probe:0.25.1
  - name: example-hotrod
    mimeType: application/vnd.docker.image
    reference: docker.io/jaegertracing/example-hotrod:1.72.0
  - name: jaeger-integration-tests
    mimeType: application/vnd.docker.image
  - name: jaeger-es-index-cleaner
    mimeType: application/vnd.docker.image
    reference: docker.io/jaegertracing/jaeger-es-index-cleaner:1.72.0
  - name: jaeger-es-rollover
    mimeType: application/vnd.docker.image
    reference: docker.io/jaegertracing/jaeger-es-rollover:1.72.0
  - name: envoy
    mimeType: application/vnd.docker.image
    reference: docker.io/envoyproxy/envoy:v1.32.6
  - name: openjdk
    mimeType: application/vnd.docker.image
    reference: docker.io/openjdk:11
  - name: spark-dependencies-image
    mimeType: application/vnd.docker.image
    reference: ghcr.io/jaegertracing/spark-dependencies/spark-dependencies:v0.5.1
  - name: qubership-deployment-status-provisioner
    mimeType: application/vnd.docker.image
    reference: ghcr.io/netcracker/qubership-deployment-status-provisioner:0.2.2
```
