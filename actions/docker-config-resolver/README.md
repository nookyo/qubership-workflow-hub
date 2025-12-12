# 🐳 Docker Configuration Resolver

Loads, validates, and normalizes Docker component configurations for CI/CD workflows. Reads a configuration file, applies defaults and security settings, and outputs a flat JSON structure ready for matrix builds.

## Features

- Validates and merges Docker component configurations (YAML/JSON support)
- Applies global defaults and security settings to all components
- Generates fully-qualified image paths (`{registry}/{owner}/{component-name}`)
- Outputs structured JSON for matrix strategies
- Supports per-component overrides for security and build settings

For example, if your configuration file defines two components, the output might be:

```json
[
  {
    "name": "qubership-nifi",
    "image": "ghcr.io/my-org/qubership-nifi",
    "registry": "ghcr.io",
    "dockerfile": "Dockerfile",
    "context": ".",
    "tags": "latest",
    "platforms": "linux/amd64, linux/arm64",
    "security_scan": true,
    "security_only_high_critical": true,
    "security_trivy_scan": true,
    "security_grype_scan": true,
    "security_only_fixed": true,
    "security_continue_on_error": true,
    "security_tag": "latest"
  },
  {
    "name": "qubership-nifi-registry",
    "image": "ghcr.io/my-org/qubership-nifi-registry",
    "registry": "ghcr.io",
    "dockerfile": "Dockerfile",
    "context": ".",
    "tags": "1.0.0",
    "platforms": "linux/amd64, linux/arm64",
    "security_scan": false,
    "security_only_high_critical": true,
    "security_trivy_scan": true,
    "security_grype_scan": true,
    "security_only_fixed": true,
    "security_continue_on_error": true,
    "security_tag": "latest"
  }
]
```

---

## Inputs & Outputs

**Input:**
- `file-path` - Path to configuration file (default: `.qubership/docker.cfg`)

**Output:**
- `config` - JSON array of resolved component configurations

**Each component includes:**
- `name`, `image`, `registry` - Component identification and image path
- `dockerfile`, `context`, `tags`, `platforms` - Build settings (from defaults or component-specific)
- `security_*` - All security settings prefixed with `security_`
- Any custom fields from configuration

## Configuration File Format

The action expects a JSON or YAML configuration file with the following structure:

```json
{
  "registry": "ghcr.io",
  "security": {
    "scan": true,
    "only_high_critical": true,
    "trivy_scan": true,
    "grype_scan": true,
    "only_fixed": true,
    "continue_on_error": true,
    "tag": "latest"
  },
  "defaults": {
    "dockerfile": "Dockerfile",
    "context": ".",
    "tags": "latest",
    "platforms": "linux/amd64, linux/arm64"
  },
  "components": [
    {
      "name": "qubership-nifi"
    },
    {
      "name": "qubership-nifi-registry",
      "tags": "1.0.0",
      "security": {
        "scan": false
      }
    }
  ]
}
```

Or in YAML format:

```yaml
registry: "ghcr.io"

security:
  scan: true
  only_high_critical: true
  trivy_scan: true
  grype_scan: true
  only_fixed: true
  continue_on_error: true
  tag: "latest"

defaults:
  dockerfile: "Dockerfile"
  context: "."
  tags: "latest"
  platforms: "linux/amd64, linux/arm64"

components:
  - name: "qubership-nifi"
  - name: "qubership-nifi-registry"
    tags: "1.0.0"
    security:
      scan: false
```

**Configuration structure:**
- `registry` (optional) - Base registry URL (e.g., `ghcr.io`)
- `defaults` (optional) - Default values for all components
- `security` (optional) - Global security settings (prefixed with `security_` in output)
- `components` (required) - Array of components, each must have `name` field

Component-specific fields override defaults. Security settings merge (component overrides global).

---

## Usage Example

```yaml
jobs:
  resolve:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.resolver.outputs.config }}
    steps:
      - uses: actions/checkout@v4
      - id: resolver
        uses: netcracker/qubership-workflow-hub/actions/docker-config-resolver@main

  build:
    needs: resolve
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: ${{ fromJson(needs.resolve.outputs.config) }}
    steps:
      - uses: actions/checkout@v4
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ${{ matrix.component.context }}
          file: ${{ matrix.component.dockerfile }}
          tags: ${{ matrix.component.image }}:${{ github.sha }}
          platforms: ${{ matrix.component.platforms }}
```

**Conditional security scanning:**
```yaml
- name: Security Scan
  if: matrix.component.security_scan == true
  run: |
    # Use security_trivy_scan, security_grype_scan flags
    trivy image ${{ matrix.component.image }}
```

## How It Works

1. Loads configuration file (JSON/YAML)
2. Validates `name` field for each component (required)
3. Generates image paths: `{registry}/{owner}/{component-name}` (or `{owner}/{component-name}` if no registry)
4. Merges settings (priority: component-specific > defaults > auto-generated)
5. Prefixes all security fields with `security_`
6. Outputs flat JSON array

**Validation:**
- Configuration file must exist
- Each component must have non-empty `name`
- File must be valid JSON/YAML

## Troubleshooting

- **File not found**: Ensure `actions/checkout@v4` runs before this action
- **`component.name is required`**: Check all components have non-empty `name` field
- **Invalid JSON**: Verify config file syntax and check action logs for "Resolved configuration (pretty)"
- **Matrix not working**: Use `${{ fromJson(needs.job-name.outputs.config) }}`

## Configuration Example

```json
{
  "registry": "ghcr.io",
  "security": {
    "scan": true,
    "only_high_critical": true,
    "trivy_scan": true,
    "grype_scan": true,
    "only_fixed": true,
    "continue_on_error": true,
    "tag": "latest"
  },
  "defaults": {
    "dockerfile": "Dockerfile",
    "context": ".",
    "tags": "latest",
    "platforms": "linux/amd64, linux/arm64"
  },
  "components": [
    {
      "name": "qubership-nifi"
    },
    {
      "name": "qubership-nifi-registry",
      "tags": "1.0.0",
      "security": {
        "scan": false
      }
    }
  ]
}
```

**Output:**
```json
[
  {
    "name": "qubership-nifi",
    "image": "ghcr.io/my-org/qubership-nifi",
    "registry": "ghcr.io",
    "dockerfile": "Dockerfile",
    "context": ".",
    "tags": "latest",
    "platforms": "linux/amd64, linux/arm64",
    "security_scan": true,
    "security_only_high_critical": true,
    "security_trivy_scan": true,
    "security_grype_scan": true,
    "security_only_fixed": true,
    "security_continue_on_error": true,
    "security_tag": "latest"
  },
  {
    "name": "qubership-nifi-registry",
    "image": "ghcr.io/my-org/qubership-nifi-registry",
    "registry": "ghcr.io",
    "dockerfile": "Dockerfile",
    "context": ".",
    "tags": "1.0.0",
    "platforms": "linux/amd64, linux/arm64",
    "security_scan": false,
    "security_only_high_critical": true,
    "security_trivy_scan": true,
    "security_grype_scan": true,
    "security_only_fixed": true,
    "security_continue_on_error": true,
    "security_tag": "latest"
  }
]
```

## Notes

- Uses `jq` for JSON processing (pre-installed on GitHub runners)
- Component names used for image paths (follow Docker naming conventions)
- Leave `registry` empty for Docker Hub format: `owner/component-name`
- Configuration supports both JSON and YAML
- Security fields always prefixed with `security_`
