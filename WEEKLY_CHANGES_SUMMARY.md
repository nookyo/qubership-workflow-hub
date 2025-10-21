# Weekly Changes Summary (October 14-21, 2025)

This document summarizes all changes made by @nookyo and @borislavr during the week of October 14-21, 2025 in the following repositories:
- **Netcracker/qubership-workflow-hub**
- **Netcracker/.github**

## Repository: Netcracker/qubership-workflow-hub

### Changes by @nookyo

#### Direct Commits
1. **e0bba319fd** - `refactor: delete unnessesary` (October 16, 2025)
2. **945ff09abd** - `Merge branch 'main'` (October 16, 2025)
3. **1ef70f2cb1** - `fix: Correct title prefix in feature request template from "[Feature]: " to "[Feat]: "` (October 1, but visible in recent activity)

#### Pull Requests Merged
- **PR #427** - fix: Update logging for final assignees in PR assignment process (Merged October 14)
  - **Status**: Merged
  - **Type**: Bug fix
  - **Summary**: Refactor pr-assigner action with improved logic and integrated action-logger for better user experience
  - **Key Changes**:
    - Replaced console.log with `@netcracker/action-logger` for consistent, colored output
    - Enhanced assignee selection and filtering logic
    - Better error handling with descriptive error messages
    - Added emoji indicators (🔍, ✔️, ❗️, ⚠️)
    - Improved self-assignment logic
  - **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/427

#### Issues Created/Updated
- **Issue #442** - [Task]: Collect all changes made during the week (Created October 21)
- **Issue #434** - [Task]: Add vulnerabilities scanning workflow to base-images repository (Closed October 15)
- **Issue #433** - [Task]: [BoradCast Job Task] Automatic PR labels based on conventional commits (Closed October 16)
- **Issue #432** - [Task]: [BoradCast Job Task] Conventional Commits PR Check (Closed October 16)

### Changes by @borislavr

#### Direct Commits
1. **fd2720b536** - `fix: added conditions on Upload metadata step` (October 14, 2025)
2. **245891a0ed** - `fix: added conditions on Upload metadata step` (October 14, 2025)
3. **c69c174950** - `fix: added conditions on Upload metadata step` (October 14, 2025)

#### Pull Requests Merged
- **PR #419** - fix: added `ref` input to metadata-action (Merged October 10, 2025 - but part of this week's context)
  - **Status**: Merged
  - **Type**: Bug fix
  - **Summary**: Added `ref` input to metadata-action
  - **Scope**: actions
  - **Link**: https://github.com/Netcracker/qubership-workflow-hub/pull/419

---

## Repository: Netcracker/.github

### Changes by @nookyo

#### Direct Commits (October 14-21, 2025)
1. **229b03bbf0** - `feat(ci): update autolabler config and add automatic PR labeler workflow` (October 15)
2. **01154b818d** - `feat: add common autolabler config files to broadcast workflow` (October 15)
3. **1bf01caf47** - `fix: comment out unused REPO_FILE handling logic in broadcast workflow` (October 15)
4. **008b1489fe** - `feat(ci): add conventional commits enforcement workflow for PR titles` (October 15)
5. **5b655ee38b** - `feat: add repo-file input to broadcast workflow and include repository list` (October 15)
6. **3c2e1aa0c6** - `feat(ci): add security scan workflow to detect vulnerabilities in dependencies` (October 15)
7. **ec3207b5a7** - `fix: Reload security scan` (October 15)
8. **2cfb3eb25d** - `fix: update pr-assigner action version to 2.0.1` (October 14)

#### Pull Requests
- **PR #181** - chore: add biome configuration file for linter setup (Merged October 16)
  - **Summary**: Added biome configuration file for linter setup and updated super-linter environment variables
  - **Link**: https://github.com/Netcracker/.github/pull/181

#### Issues
- **Issue #178** - [Bug]: Super-linter issue (Closed October 16)
  - **Summary**: Fix some ZIZMOR, BIOME etc issues
  - **Link**: https://github.com/Netcracker/.github/issues/178

### Changes by @borislavr

#### Direct Commits (October 14-21, 2025)
1. **1789097a08** - `Update broadcast-files-config.yaml` (October 13 - visible in this week)

---

## Key Activities Summary (October 14-21, 2025)

### @nookyo's Weekly Contributions

#### Netcracker/qubership-workflow-hub
- **1 major PR merged**: Enhanced PR assigner action with better logging (PR #427)
- **3 direct commits**: Refactoring and merge commits
- **4 issues managed**: Created task for collecting changes, closed 3 broadcast job tasks

#### Netcracker/.github
- **8 direct commits**: Major improvements to CI/CD workflows
- **1 PR merged**: Added biome linter configuration (PR #181)
- **1 issue closed**: Fixed super-linter issues (Issue #178)

**Key Contributions**:
- Enhanced PR auto-assignment workflow with better logging and error handling
- Added security scanning workflow for dependency vulnerability detection
- Implemented conventional commits enforcement for PR titles
- Added automatic PR labeler workflow based on conventional commits
- Updated broadcast workflow with auto-labeler configuration
- Fixed super-linter issues related to ZIZMOR and BIOME

### @borislavr's Weekly Contributions

#### Netcracker/qubership-workflow-hub
- **3 direct commits**: Fixed conditions on metadata upload step
- **1 PR merged**: Added `ref` input to metadata-action (PR #419)

#### Netcracker/.github
- **1 direct commit**: Updated broadcast-files-config.yaml

**Key Contributions**:
- Enhanced metadata-action with `ref` input parameter
- Fixed upload metadata step conditions
- Updated broadcast configuration files

---

## Technical Highlights

### Code Quality & Linting
- Added biome linter configuration to .github repository
- Fixed multiple super-linter issues (ZIZMOR, BIOME)
- Enhanced code quality checks across the organization

### CI/CD Improvements
- Enhanced PR auto-assignment workflow with improved logging using `@netcracker/action-logger`
- Added security scanning workflow for vulnerability detection
- Implemented conventional commits enforcement
- Added automatic PR labeling based on commit types

### Action Enhancements
- Improved pr-assigner action with better error handling and user feedback
- Enhanced metadata-action with `ref` input parameter
- Fixed upload metadata conditions

### Documentation & Configuration
- Updated broadcast workflow configurations
- Added auto-labeler configuration files
- Improved workflow documentation and templates

---

## Statistics

### Netcracker/qubership-workflow-hub
- **Total Commits by @nookyo**: 3
- **Total Commits by @borislavr**: 3
- **Total PRs Merged**: 2 (1 by @nookyo, 1 by @borislavr)
- **Total Issues**: 7 (4 managed by @nookyo)

### Netcracker/.github
- **Total Commits by @nookyo**: 8
- **Total Commits by @borislavr**: 1
- **Total PRs Merged**: 1 (by @nookyo)
- **Total Issues**: 1 (by @nookyo)

---

*Generated on: October 21, 2025*
*Report Period: October 14-21, 2025*
*Repositories: Netcracker/qubership-workflow-hub, Netcracker/.github*
