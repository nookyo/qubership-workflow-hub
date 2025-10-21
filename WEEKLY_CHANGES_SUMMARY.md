# Weekly Changes Summary

This document summarizes the changes made by @nookyo and @borislavr during the week.

## Changes by @nookyo

### Pull Requests

#### PR #427 - fix: Update logging for final assignees in PR assignment process
- **Status**: Merged (October 14, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Refactor pr-assigner action with improved logic and integrated action-logger for better user experience. Enhanced assignment logic, improved error handling, and added structured colored logging throughout the workflow.
- **Key Changes**:
  - Replaced console.log with `@netcracker/action-logger` for consistent, colored output
  - Enhanced assignee selection and filtering logic
  - Better error handling with descriptive error messages
  - Added emoji indicators for different message types (🔍, ✔️, ❗️, ⚠️)
  - Improved self-assignment logic
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/427

#### PR #426 - Update PR assigner action and token secret (#425)
- **Status**: Closed (October 13, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Update PR assigner action and token secret
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/426

#### PR #425 - fix: Update PR assigner action and token secret
- **Status**: Merged (October 13, 2025)
- **Type**: Bug fix
- **Summary**: Update PR assigner action and token secret
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/425

#### PR #423 - 421 feat auto assign pr to author if listed in codeowners
- **Status**: Merged (October 13, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Auto assign PR to author if listed in codeowners
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/423

#### PR #420 - Update README.md
- **Status**: Closed (October 13, 2025)
- **Type**: Documentation update
- **Summary**: Update README.md
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/420

#### PR #417 - fix: Fixed errors who found in BIOME_LINT
- **Status**: Merged (October 9, 2025)
- **Type**: Bug fix & Enhancement & Refactor
- **Labels**: bug, enhancement, refactor
- **Summary**: Introduce `@netcracker/action-logger` package - a standardized, reusable logging solution for GitHub Actions in the qubership-workflow-hub.
- **Key Changes**:
  - Created complete `@netcracker/action-logger` package with comprehensive logging features
  - Full migration from local logger to shared package
  - Added comprehensive `debugJSON()` calls for inputs, loaded configuration, and template values
  - Fixed regex character class escaping in `fillTemplate()` function
  - Replaced unsafe `isNaN()` with `Number.isNaN()` for proper type checking
  - Completely rewrote `flattenObject()` function using proper `for...of` iteration
  - Fixed variable declarations (`let` to `const` where immutable)
  - Enhanced error handling and logging throughout the action
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/417

#### PR #412 - feat: introduce @netcracker/action-logger package for standardized logging across actions
- **Status**: Merged (October 9, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Summary**: Introduce `@netcracker/action-logger` package - a standardized logging solution for GitHub Actions.
- **Key Changes**:
  - Created `@netcracker/action-logger` package with enhanced logging features
  - `log.group()` and `log.endGroup()` for organized output sections
  - `log.success()`, `log.warn()`, `log.error()` for different message types
  - `log.dim()` for less prominent debug information
  - `log.setDebug()` for conditional debug output control
  - `log.debug()` for debug-only messages that respect debug mode
  - `log.debugJSON()` for structured JSON object debugging
  - Consistent formatting and colors for better readability
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/412

#### PR #406 - refactor: consolidate input handling in run function and enhance Logger class for debug mode
- **Status**: Merged (October 7, 2025)
- **Type**: Enhancement, Documentation, Refactor
- **Labels**: documentation, enhancement, refactor
- **Summary**: Add configurable replacement for `/` characters in Git references within the metadata-action.
- **Key Changes**:
  - Introduced `RefNormalizer` class in `src/extractor.js`
  - `extract(ref, replaceSymbol = "-")` method for normalizing branch/tag names
  - Validates input and detects ref type (branch, tag, or unknown)
  - Replaces all `/` with `replaceSymbol` using global regex
  - Added 4 test files covering unit and integration scenarios
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/406

#### PR #405 - feat: Add wait-for-workflow GitHub Action and update documentation
- **Status**: Merged (October 6, 2025)
- **Type**: Enhancement, Documentation, Refactor
- **Labels**: documentation, enhancement, refactor
- **Summary**: Adds a new GitHub Action `wait-for-workflow` that waits for a specific GitHub Actions workflow to start and complete successfully.
- **Key Changes**:
  - New action: `actions/wait-for-workflow`
  - Supports two operational modes: workflow file name and numeric run ID inputs
  - Automatically matches workflows by commit SHA or PR number
  - Configurable timeouts for workflow start detection (`max-wait`) and completion (`timeout`)
  - Uses GitHub CLI (`gh`) for API interactions and `jq` for JSON parsing
  - Updated documentation with comprehensive README
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/405

#### PR #397 - fix: Fix metadata-action runNumber alias resolution bug
- **Status**: Merged (October 1, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Fix bug in metadata-action where the alias runNumber cannot be resolved in templates.
- **Key Changes**:
  - Added fallback for runNumber in the values object
  - If github.context.runNumber is undefined or null, use github.run_number
  - Updated unit tests to cover the case where runNumber is undefined
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/397

#### PR #390 - feat: Add On-Demand Security Scan Workflow documentation for Grype and Trivy
- **Status**: Merged (September 26, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Summary**: Added re-security-scan On-demand security scan (Grype + Trivy)
- **Scope**: documentation
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/390

#### PR #392 - 381 task documentation update for workflow hub
- **Status**: Closed (September 26, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Summary**: Documentation update for workflow hub
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/392

#### PR #391 - Internal merge
- **Status**: Merged (September 26, 2025)
- **Summary**: Internal merge
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/391

#### PR #389 - fix: Remove deprecated archive-and-upload-assets action
- **Status**: Merged (September 26, 2025)
- **Type**: Bug fix, Documentation
- **Labels**: bug, documentation
- **Summary**: Eliminate the deprecated archive-and-upload-assets action and update documentation to reflect its removal.
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/389

#### PR #387 - fix: Remove deprecated tag-checker action and related files
- **Status**: Merged (September 26, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Delete tag-checker action
- **Key Changes**:
  - Deleted the tag-checker action implementation (index.js)
  - Removed related license, package.json, and package-lock.json files
  - Updated documentation to reflect deprecation
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/387

#### PR #385 - fix: Remove deprecated commit-and-push action and associated files
- **Status**: Merged (September 26, 2025)
- **Type**: Bug fix, Documentation
- **Labels**: bug, documentation
- **Summary**: Remove deprecated commit-and-push action and associated files
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/385

#### PR #383 - fix: Remove deprecated pom-updater action and associated files
- **Status**: Merged (September 26, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Remove deprecated pom-updater action and associated files
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/383

#### PR #378 - fix: Fix artifact download, image refs generation, and context handling in docker-action
- **Status**: Merged (September 26, 2025)
- **Type**: Bug fix, Documentation, Enhancement, Refactor
- **Labels**: bug, documentation, enhancement, refactor
- **Summary**: Address several issues in the docker-action composite action related to artifact downloading, Docker image tag generation, and build context configuration.
- **Key Changes**:
  - Fixed Artifact Download Logic
  - Corrected Image Refs Generation
  - Updated Build Context
  - Added Debug Step
  - Input Fixes
  - New Action: smart-download
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/378

#### PR #380 - feat: Add on-demand security scan workflow with Grype and Trivy
- **Status**: Merged (September 26, 2025)
- **Type**: Bug fix, Enhancement
- **Labels**: bug, enhancement
- **Summary**: Add on-demand security scan workflow with Grype and Trivy
- **Scope**: reusable workflow
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/380

#### PR #377 - docs: update release drafter workflow path in README
- **Status**: Merged (September 25, 2025)
- **Type**: Documentation
- **Labels**: documentation
- **Summary**: Update release drafter workflow path in README
- **Scope**: docs
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/377

---

## Changes by @borislavr

### Pull Requests

#### PR #419 - fix: added `ref` input to metadata-action
- **Status**: Merged (October 10, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Added `ref` input to metadata-action
- **Scope**: actions
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/419

#### PR #418 - fix: fixed severity scope on Grype CSV file generation
- **Status**: Merged (October 9, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Fixed severity scope on Grype CSV file generation. Now only High & Critical vulnerabilities go to CSV when `only-high-critical` workflow parameter set to `true`
- **Scope**: workflows
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/418

#### PR #413 - feat: re-security-scan.yml now creates CSV files with found vulnerabilities
- **Status**: Merged (October 9, 2025)
- **Type**: Enhancement, Refactor
- **Labels**: enhancement, refactor
- **Summary**: re-security-scan.yml now creates CSV files with found vulnerabilities and uploads them as artifacts
- **Key Changes**:
  - SARIF files, generated by Grype and Trivy converted to CSV format
- **Scope**: workflows
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/413

#### PR #407 - BREAKING: deleted unused/deprecated reusable workflows
- **Status**: Merged (October 7, 2025)
- **Type**: Breaking change
- **Labels**: breaking-change
- **Summary**: Deleted unused/deprecated reusable workflows
- **Key Changes**:
  - Removed create-github-release.yml
  - Removed docker-publish.yml
  - Removed maven-central-snapshot-deploy-reusable.yaml
  - Removed maven-publish.yml
  - Removed re-maven-snapshot-deploy.yaml
  - Removed tag-creator.yml
- **Scope**: workflows
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/407

#### PR #400 - fix: Update Trivy severity levels and enhance Grype SARIF filtering logic
- **Status**: Merged (October 7, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Trivy and Grype will report issues with existing fix only. Severity levels high (>=7.0 and <= 8.9) and critical (>=9.0)
- **Scope**: workflows
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/400

#### PR #395 - feat: charts-values-update-action can optionally publish charts to ghcr.io
- **Status**: Merged (September 30, 2025)
- **Type**: Bug fix, Documentation, Enhancement
- **Labels**: bug, documentation, enhancement
- **Summary**: charts-values-update-action can optionally publish charts to `ghcr.io` and outputs charts meta-data needed for AM generation
- **Scope**: actions
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/395

#### PR #374 - feat: update release-drafter.yml
- **Status**: Merged (September 25, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Summary**: Added `latest` flag
- **Scope**: workflows
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/374

#### PR #370 - feat: added warning messages into chart-values-update-action log
- **Status**: Merged (September 23, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Summary**: Added warning messages into `chart-values-update-action` log if configured image not found in values file.
- **Scope**: actions
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/370

#### PR #368 - fix: update action.yaml
- **Status**: Merged (September 17, 2025)
- **Type**: Bug fix
- **Labels**: bug
- **Summary**: Now release can be made from any branch not only from `main`
- **Scope**: actions
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/368

#### PR #344 - feat: added new parameter `download-artifact-merge-multiple` into `docker-action`
- **Status**: Merged (September 15, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Summary**: Added new parameter `download-artifact-merge-multiple: false` to `docker-action` to support `merge-multiple` parameter of `actions/download-artifact`
- **Scope**: actions
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/344

#### PR #338 - feat: update maven-snapshot-deploy action
- **Status**: Merged (September 5, 2025)
- **Type**: Documentation, Enhancement
- **Labels**: documentation, enhancement
- **Summary**: Added `sonar-token` input parameter
- **Scope**: actions
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/338

#### PR #329 - feat: Added a new optional parameter to Container Package Cleanup Action
- **Status**: Merged (September 4, 2025)
- **Type**: Bug fix, Documentation, Enhancement
- **Labels**: bug, documentation, enhancement
- **Summary**: Added a new optional parameter `threshold-versions` to "Container Package Cleanup Action".
- **Key Changes**:
  - `threshold-versions` applicable only to maven artifacts cleanup
  - When provided, the action will leave the number of newest versions untouched
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/329

#### PR #313 - chore(issues): update feature_request.yml
- **Status**: Merged (September 3, 2025)
- **Summary**: Update feature request template
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/313

#### Historical PRs (for reference):

#### PR #289 - chore: Reusable workflows now have `Reusable` prefix in their names
- **Status**: Closed (August 14, 2025)
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/289

#### PR #233 - docs: add mandatory workflows list to README.md
- **Status**: Merged (June 11, 2025)
- **Type**: Enhancement
- **Labels**: enhancement
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/233

#### PR #206 - feat: Update Maven GitHub Action configuration
- **Status**: Merged (June 2, 2025)
- **Type**: Bug fix, Enhancement
- **Labels**: bug, enhancement
- **Summary**: Refine the GitHub Action for Maven by removing the alternative store parameter, updating the GITHUB_TOKEN reference, and adding GitHub server configuration to Maven settings.
- **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/206

---

## Summary Statistics

### @nookyo
- **Total Pull Requests**: 24
- **Merged**: 20
- **Closed**: 4
- **Primary Focus Areas**:
  - Action improvements and refactoring
  - Logging infrastructure (`@netcracker/action-logger`)
  - Bug fixes in metadata-action
  - Documentation updates
  - Removal of deprecated actions
  - Security scan workflows

### @borislavr
- **Total Pull Requests**: 19
- **Merged**: 17
- **Closed**: 2
- **Primary Focus Areas**:
  - Workflow enhancements
  - Security improvements (Grype, Trivy)
  - Maven and Docker action updates
  - Charts and container package management
  - Breaking changes (removal of deprecated workflows)

## Key Themes

1. **Code Quality & Linting**: Multiple PRs focused on improving code quality through biome linting compliance
2. **Logging Infrastructure**: Introduction of standardized `@netcracker/action-logger` package
3. **Security**: Enhanced security scanning with Grype and Trivy
4. **Deprecation Cleanup**: Removal of deprecated actions and workflows
5. **Documentation**: Multiple documentation updates and improvements
6. **Bug Fixes**: Various bug fixes in actions and workflows
7. **Feature Enhancements**: New features for Docker actions, Maven actions, and chart management

---

_Generated on: $(date)_
