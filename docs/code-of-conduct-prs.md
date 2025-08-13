# Contribution & Pull Request Conduct

This page defines how to open a high‑quality Pull Request (PR) for this repository. Follow it to keep reviews fast, traceable and consistent.

---
## 1. PR Preconditions Checklist
Before opening a PR you MUST ensure:
 
| Check | Status |
|-------|--------|
| Related issue exists (not just an idea) |  |
| Local lint/tests (if applicable) pass |  |
| Docs updated (README / conventions / examples) |  |
| Deprecation map updated (if removing/replacing) |  |
| Version bump strategy considered (if behavior change) |  |
| Branch name references issue (e.g. `292-action-...`) |  |

---
## 2. Mandatory PR Fields
Provide or verify the following in the PR description:
 
| Field | MUST Have | Example |
|-------|-----------|---------|
| Title | Conventional commit style | `feat: implement deletePackageVersion utility` |
| Project / Area | Clear component / folder | `actions/container-package-cleanup` |
| Issue Link | `Fixes #<id>` or `Related to #<id>` | `Fixes #123` |
| Summary | 1–3 lines what & why | "Add dry-run support" |
| Change Type | feat / fix / docs / chore / refactor / deprecate | `feat` |
| Breaking? | Yes/No + migration note if Yes | `No` |
| Labels | At least one classification label | `type:feature` |
| Test Evidence | Link / short output / screenshot if relevant | `Logs attached` |

Title MUST follow Conventional Commits: `<type>(optional-scope): short imperative`. Types allowed: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`.

Recommended branch naming: `<issue>-<short-kebab-summary>` (example from PR #293: `292-action-container-package-cleanup-remove-all-unnecessary-untagged-or-sha256-layers-versions`). Keep under ~72 chars where possible.

Short template you can paste:
```md
### Summary
<what changed and why>

### Issue
Fixes #<id>

### Type
feat | fix | docs | chore | refactor | deprecate

### Breaking Change?
No (or Yes + migration notes)

### Scope / Project
<folder or component>

### Implementation Notes
<key points / constraints>

### Tests / Evidence
<how verified>

### Additional Notes
<any risk, follow-up, rollout>
```

### 2.1 PR Title Requirements
Your PR title is REQUIRED to follow Conventional Commit style.

Format: `<type>(optional-scope): <short imperative description>`

Allowed `<type>` values:
 
| Type | Use For |
|------|---------|
| feat | New feature / capability |
| fix | Bug fix (behaviour now correct) |
| docs | Documentation-only changes |
| refactor | Internal code change without behaviour change |
| perf | Performance improvement |
| test | Add / adjust tests only |
| ci | Workflow / pipeline changes |
| build | Build system or dependencies |
| chore | Maintenance (no prod behaviour impact) |
| revert | Revert a previous commit |
| deprecate | Mark functionality as deprecated |

Rules:
1. Exactly one type (no stacking like `feat fix:`).
2. Scope optional; if used, lowercase kebab-case (e.g. `metadata-action`).
3. Description: imperative mood, lowercase first letter (unless proper noun), no trailing period.
4. Keep total length ≤ 72 characters where feasible.
5. Avoid issue numbers in title (they belong in body via `Fixes #123`).

Examples (GOOD):
```text
feat(metadata-action): add dry-run input
fix(container-package-cleanup): handle 403 errors from API
docs: clarify version pinning section
ci: parallelize sbom and test jobs
refactor(tag-action): extract version parser
```

Examples (BAD + reason):
```text
Feature: Added new stuff            # Not lowercase type, vague
feat: Fix bug with tags             # Description not imperative ("Fix"/imperative ok but context vague)
fix(metadata-action): fixed issue   # Past tense
feat+fix: add and repair things     # Multiple types
docs: update README.                # Trailing period
```

If the scope is broad (touches many areas) omit scope rather than stacking multiple scopes.

---
## 3. Labels
When a PR comes from a fork, automation may NOT apply labels. You MUST manually add labels in the GitHub UI after opening the PR.

Recommended label categories:
 
| Category | Examples |
|----------|----------|
| Type | `type:feature`, `type:bug`, `type:docs`, `type:refactor` |
| Scope | `scope:actions`, `scope:workflows`, `scope:docs` |
| Impact | `impact:breaking`, `impact:security`, `impact:performance` |
| Status | `needs-review`, `blocked`, `ready` |

Minimal required: one Type label. Add more if they add clarity.

Order of operations (ideal): open PR (draft if WIP) → ensure title format → add labels (forks: manual) → request reviewers.

### 3.1 Repository Label Definitions
| Label | Purpose / When to Use | Notes |
|-------|-----------------------|-------|
| `enhancement` | Incremental improvement to existing functionality | Not a new standalone feature |
| `feature` | Net-new capability / larger scoped addition | Prefer pairing with an issue describing scope |
| `bug` | Something is broken vs expected behaviour | Must link a reproduction or failing scenario |
| `ci` | CI pipeline / workflow related change | Use with feature/bug if both apply |
| `documentation` | Docs-only content (README, guides) | No runtime code changes |
| `duplicate` | Issue/PR already exists | Close with link to canonical item |
| `good first issue` | Simple, well-scoped starter task | Requires clear acceptance criteria |
| `help wanted` | Maintainers request external assistance | Provide context & blockers in issue |
| `invalid` | Not reproducible / off-scope / incorrect | Add short reason before closing |
| `profane content 🤬` | Auto/Manual flag for profanity in title/body | Sanitize or close depending on severity |
| `question` | Inquiry / clarification needed | Convert to issue/feature once clarified |
| `refactor` | Internal code structure change (no behaviour change) | Ensure tests unchanged or adjusted intentionally |
| `wontfix` | Decision: will not address | Provide rationale and alternatives |

Disambiguation:
- Prefer `feature` over `enhancement` for substantial new user-facing capability; otherwise use `enhancement`.
- Do NOT combine `feature` and `enhancement` together.
- A `refactor` with a behaviour change is not a refactor: classify as `feat` or `fix`.

Minimum label bundle examples:
 
| Scenario | Suggested Labels |
|----------|------------------|
| New action added | `feature`, `scope:actions` |
| Add dry-run flag | `enhancement`, `scope:actions` |
| Fix version parsing bug | `bug`, `scope:actions` |
| Docs update only | `documentation`, `scope:docs` |
| Large structural cleanup | `refactor`, `scope:actions` |

---
## 4. Issue Linking Rules
MUST link an issue unless the change is trivial (typo / formatting). Use GitHub keywords to auto-close when merged:
- `Fixes #123` (will close)
- `Closes #123`
- `Related to #456` (won't close)

If no issue exists: open one first with context & acceptance criteria.

---
## 5. Project / Component Identification
State clearly which part you touch:
- Action: `actions/<name>`
- Workflow: `reusable/<workflow-id>` or path
- Docs: `docs/<path>`
- Infra / meta: root configs (e.g. CODEOWNERS, conventions)

If multiple areas: list each so reviewers can redirect to proper owners.

---
## 6. Quality Expectations
| Aspect | Minimum |
|--------|---------|
| Style | Follow existing patterns; no broad reformatting |
| Security | No new secrets; least privileges maintained |
| Backwards compatibility | Avoid breaking unless justified + documented |
| Logs | No sensitive info; debug behind flags |
| Tests (if applicable) | Cover new logic or explain absence |
| Commit count | Prefer 1 squashed commit (or small logical set) |
| Diff focus | Only related files; no mass formatting |

---
## 7. Review Flow
1. Open draft PR early if large.
2. Ensure description template filled BEFORE requesting review.
3. Add/confirm labels (fork PRs especially).
4. Request reviewers (CODEOWNERS auto-assignment + any domain experts).
5. Address review comments; resolve conversations only after change applied.
6. Squash or conventional commits (consistent history).
7. Ensure green checks before merge.
8. Final re-read of title & description (still accurate?) before merging.

Automated checks: All required GitHub Actions / CI jobs MUST be green. Example (PR #293): 17/17 checks passed prior to merge.

---
## 8. Do & Don't (Quick Reference)
| Do | Don't |
|----|-------|
| Link an issue | Open PR with no context |
| Keep PR focused | Mix unrelated refactors |
| Provide minimal reproducible example | Paste full raw logs without trimming |
| Add docs for new inputs/outputs | Leave README outdated |
| Mark breaking changes clearly | Hide silent behavior change |

---
## 9. Example Good PR Description
Real closed example (follows title, issue link, labels, green checks): https://github.com/Netcracker/qubership-workflow-hub/pull/293
 
```
### Summary
Add 'dry-run' input to metadata-action to allow safe preview of computed tags.

### Issue
Fixes #342

### Type
feat

### Breaking Change?
No

### Scope / Project
actions/metadata-action

### Implementation Notes
Adds optional input `dry-run`; skips tag push when true. Updated README + conventions.

### Tests / Evidence
Manual run in fork: screenshot attached. Logic covered by existing tag computation test.

### Additional Notes
Follow-up: add same flag to docker-action for symmetry.
```

---
## 10. Common Rejection Reasons
| Reason | Fix |
|--------|-----|
| No linked issue | Create issue, update PR description |
| Missing labels | Add at least a Type label |
| Description empty sections | Fill or remove unused headers |
| Undocumented new input/output | Update README and conventions |
| Behavior change w/o migration notes | Add Breaking Change section |
| Non-conventional title | Rewrite to Conventional Commit format |
| Branch name opaque | Rename (or clarify in description) with issue ref |
| Unrelated bulk changes | Split into focused PRs |

---
## 11. After Merge
| Action | When |
|--------|------|
| Close related issues (auto if Fixes used) | Immediately |
| Update release notes / changelog | On merge of feature / fix |
| Tag new version (if action changed) | After merge & validation |
| Communicate deprecation (if applicable) | Before tag / release |
| Housekeeping (delete merged branch) | After confirming no rollback needed |

---
## 12. Support
Questions about this process: open an issue with label `type:docs` or ask maintainers directly.

Consistent PR hygiene keeps review cycles short and quality high.
