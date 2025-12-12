# 🐳 Docker Configuration Resolver

This **Docker Configuration Resolver** GitHub Action loads, validates, and normalizes Docker component configurations for CI/CD workflows. It reads a configuration file, applies defaults, merges security settings, and outputs a flat JSON structure ready for use in automated workflows.

---

## Features

- Loads and validates Docker component configuration from a YAML/JSON file.
- Automatically applies registry and security defaults to all components.
- Merges global defaults with component-specific configurations.
- Generates fully-qualified image paths based on registry and repository owner.
- Validates required fields (component names must be specified).
- Outputs structured JSON configuration for easy integration in CI/CD pipelines.
- Supports global and per-component security settings.

### Action Result

The primary output of this action is a normalized JSON array containing all Docker components with resolved configurations. Each component includes the image path, registry, and merged settings.

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

## 📌 Inputs

| Name        | Description                                       | Required | Default                 |
| ----------- | ------------------------------------------------- | -------- | ----------------------- |
| `file-path` | Path to the Docker components configuration file. | No       | `.qubership/docker.cfg` |

---

## 📤 Outputs

| Name     | Description                                                                        | Example                                                             |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `config` | Resolved Docker components configuration in JSON format with all defaults applied. | `[{"name":"app","image":"ghcr.io/owner/app","registry":"ghcr.io"}]` |

### Configuration Object Structure

Each component in the `config` output array contains:

| Field        | Description                                     | Example                         |
| ------------ | ----------------------------------------------- | ------------------------------- |
| `name`       | The name of the Docker component                | `qubership-nifi`                |
| `image`      | The fully-qualified image path                  | `ghcr.io/my-org/qubership-nifi` |
| `registry`   | The container registry                          | `ghcr.io`                       |
| `dockerfile` | Path to Dockerfile (from defaults or component) | `Dockerfile`                    |
| `context`    | Build context path (from defaults or component) | `.`                             |
| `tags`       | Image tags (from defaults or component)         | `latest` or `1.0.0`             |
| `platforms`  | Target platforms (from defaults or component)   | `linux/amd64, linux/arm64`      |
| `security_*` | Security settings (prefixed with `security_`)   | `security_scan: true`           |
| Other fields | Any additional custom fields from configuration | Custom build args, etc.         |

---

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

### Configuration Fields

**Top-level fields:**

- `registry` (optional): Base registry URL. If omitted, images will use format `owner/component-name`.
- `defaults` (optional): Default values applied to all components.
- `security` (optional): Global security settings applied to all components.
- `components` (required): Array of component configurations.

**Component fields:**

- `name` (required): Unique name for the component. Used to generate the image path.
- `security` (optional): Component-specific security settings that override global settings.
- Any other fields are merged with defaults.

**Security settings:**

All fields from the `security` object (global or component-level) are prefixed with `security_` in the output. For example:

```yaml
security:
  scan: true
  only_high_critical: true
  trivy_scan: true
  grype_scan: true
  only_fixed: true
  continue_on_error: true
  tag: "latest"
```

Becomes:

```json
{
  "security_scan": true,
  "security_only_high_critical": true,
  "security_trivy_scan": true,
  "security_grype_scan": true,
  "security_only_fixed": true,
  "security_continue_on_error": true,
  "security_tag": "latest"
}
```

---

## Usage Example

Below is an example of how to use this action in a GitHub Actions workflow:

```yaml
name: Build Docker Images

on:
  push:
    branches: [main]

jobs:
  resolve-config:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.resolver.outputs.config }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Resolve Docker Configuration
        id: resolver
        uses: netcracker/qubership-workflow-hub/actions/docker-config-resolver@main
        with:
          file-path: .qubership/docker.cfg

      - name: Display Configuration
        run: |
          echo "Resolved Docker configuration:"
          echo '${{ steps.resolver.outputs.config }}' | jq '.'

  build:
    needs: resolve-config
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: ${{ fromJson(needs.resolve-config.outputs.config) }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker Image
        run: |
          echo "Building image: ${{ matrix.component.image }}"
          docker build \
            -t ${{ matrix.component.image }}:latest \
            -f ${{ matrix.component.dockerfile }} \
            ${{ matrix.component.context }}
```

---

## Advanced Usage Examples

### Custom Configuration File Path

```yaml
- name: Resolve Docker Configuration
  id: resolver
  uses: netcracker/qubership-workflow-hub/actions/docker-config-resolver@main
  with:
    file-path: config/docker-components.json
```

### Matrix Strategy for Multi-Component Builds

```yaml
jobs:
  resolve:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.resolver.outputs.config }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Resolve Configuration
        id: resolver
        uses: netcracker/qubership-workflow-hub/actions/docker-config-resolver@main

  build-and-push:
    needs: resolve
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: ${{ fromJson(needs.resolve.outputs.config) }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ matrix.component.registry }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ${{ matrix.component.context }}
          file: ${{ matrix.component.dockerfile }}
          push: true
          tags: ${{ matrix.component.image }}:${{ github.sha }}
```

### Conditional Security Scanning

```yaml
jobs:
  resolve:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.resolver.outputs.config }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Resolve Configuration
        id: resolver
        uses: netcracker/qubership-workflow-hub/actions/docker-config-resolver@main

  scan:
    needs: resolve
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: ${{ fromJson(needs.resolve.outputs.config) }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Security Scan
        if: matrix.component.security_scan == true
        run: |
          echo "Running security scan for: ${{ matrix.component.name }}"
          # Add your security scanning tool here
```

### Using with Docker Compose

```yaml
- name: Resolve Configuration
  id: resolver
  uses: netcracker/qubership-workflow-hub/actions/docker-config-resolver@main

- name: Generate Docker Compose
  run: |
    CONFIG='${{ steps.resolver.outputs.config }}'

    # Generate docker-compose.yml from configuration
    echo "version: '3.8'" > docker-compose.yml
    echo "services:" >> docker-compose.yml

    echo "$CONFIG" | jq -r '.[] | "  \(.name):\n    image: \(.image):latest\n    build:\n      context: \(.context)\n      dockerfile: \(.dockerfile)"' >> docker-compose.yml

- name: Build with Docker Compose
  run: docker-compose build
```

---

## Additional Information

### How It Works

1. **File Loading**: Reads the configuration file from the specified path.
2. **Validation**: Ensures all components have a `name` field (fails if missing).
3. **Registry Resolution**: Determines the image path based on:
   - If `registry` is defined: `{registry}/{owner}/{component-name}`
   - If `registry` is empty: `{owner}/{component-name}`
4. **Defaults Merging**: Merges global `defaults` with component-specific settings.
5. **Security Merging**: Merges global `security` with component-specific security settings.
6. **Prefixing**: All security fields are prefixed with `security_` in the output.
7. **Output**: Returns a flat JSON array with all resolved configurations.

### Field Merging Order

The action applies configurations in the following priority order (highest to lowest):

1. Component-specific fields (highest priority)
2. Global `defaults` fields
3. Auto-generated fields (`name`, `image`, `registry`)

For security settings:

1. Component-specific `security` fields
2. Global `security` fields

### Validation Rules

- **Required**: Every component must have a `name` field.
- **Non-empty**: Component names cannot be empty strings or null values.
- **File Existence**: The configuration file must exist at the specified path.

### Error Handling

The action will fail if:

- The configuration file is not found at the specified path.
- Any component is missing the `name` field.
- Any component has an empty or null `name` value.
- The configuration file contains invalid JSON/YAML syntax.

---

## Troubleshooting

### Configuration File Not Found

If the action fails with "Config file not found":

1. Verify the file exists at the specified path (default: `.qubership/docker.cfg`).
2. Ensure the repository is checked out before running this action (`actions/checkout@v4`).
3. Check the file path for typos or incorrect directory structure.
4. Use a relative path from the repository root.

### Component Name Validation Error

If you receive "component.name is required":

1. Ensure every component in the `components` array has a `name` field.
2. Verify that `name` values are not empty strings or null.
3. Check for YAML/JSON formatting errors in the configuration file.

### Invalid JSON Output

If the output cannot be parsed:

1. Check the action logs for the "Resolved configuration (pretty)" output.
2. Verify your configuration file syntax is valid JSON or YAML.
3. Ensure there are no special characters in component names that could break JSON formatting.

### Matrix Strategy Not Working

If the matrix strategy doesn't expand correctly:

1. Verify you're using `${{ fromJson(...) }}` to parse the config output.
2. Check that the config output is a valid JSON array.
3. Ensure the job dependency is correctly set with `needs:`.
4. Review the job outputs section to ensure the config is properly exposed.

---

## Use Cases

- **Multi-Component Monorepos**: Build and deploy multiple Docker images from a single repository with consistent configuration.
- **Centralized Configuration**: Maintain all Docker build settings in one file for easier management.
- **Security Standardization**: Apply consistent security policies across all Docker components.
- **Dynamic Workflows**: Generate matrix strategies dynamically based on repository configuration.
- **Environment-Specific Builds**: Use different configuration files for different environments (dev, staging, production).
- **Build Optimization**: Apply different build contexts and Dockerfiles while maintaining consistency.
- **Registry Management**: Easily switch between registries (GHCR, Docker Hub, private registries) for all components.

---

## Configuration Examples

### Simple Configuration

```yaml
components:
  - name: "api"
  - name: "web"
  - name: "worker"
```

**Output:**

```json
[
  { "name": "api", "image": "my-org/api", "registry": "" },
  { "name": "web", "image": "my-org/web", "registry": "" },
  { "name": "worker", "image": "my-org/worker", "registry": "" }
]
```

### With Registry and Defaults

```yaml
registry: "ghcr.io"

defaults:
  dockerfile: "Dockerfile"
  context: "."

components:
  - name: "backend"
    context: "services/backend"

  - name: "frontend"
    context: "apps/web"
    dockerfile: "apps/web/Dockerfile.prod"
```

**Output:**

```json
[
  {
    "name": "backend",
    "image": "ghcr.io/my-org/backend",
    "registry": "ghcr.io",
    "dockerfile": "Dockerfile",
    "context": "services/backend"
  },
  {
    "name": "frontend",
    "image": "ghcr.io/my-org/frontend",
    "registry": "ghcr.io",
    "dockerfile": "apps/web/Dockerfile.prod",
    "context": "apps/web"
  }
]
```

### With Security Settings (Full Example)

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

---

## Notes

- The action uses `jq` for JSON processing, which is available by default on GitHub-hosted runners.
- Component names are used to generate image paths and should follow Docker naming conventions.
- The `registry` field can be left empty to use default `owner/component-name` format (useful for Docker Hub).
- All outputs are logged in pretty-printed format for debugging purposes.
- The configuration file can be either JSON or YAML format (both are supported by `jq`).
- Security settings are always prefixed with `security_` to avoid naming conflicts with other fields.
