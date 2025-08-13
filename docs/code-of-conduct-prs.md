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

---
## 2. Mandatory PR Fields
Provide or verify the following in the PR description:
| Field | MUST Have | Example |
|-------|-----------|---------|
| Project / Area | Clear component / folder | `actions/metadata-action` |
| Issue Link | `Fixes #<id>` or `Related to #<id>` | `Fixes #123` |
| Summary | 1–3 lines what & why | "Add dry-run support" |
| Change Type | feat / fix / docs / chore / refactor / deprecate | `feat` |
| Breaking? | Yes/No + migration note if Yes | `No` |
| Labels | At least one classification label | `type:feature` |
| Test Evidence | Link / short output / screenshot if relevant | `Logs attached` |

Short template you can paste:
```
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

---
## 7. Review Flow
1. Open draft PR early if large.
2. Ensure description template filled BEFORE requesting review.
3. Add/confirm labels (fork PRs especially).
4. Request reviewers (CODEOWNERS auto-assignment + any domain experts).
5. Address review comments; resolve conversations only after change applied.
6. Squash or conventional commits (consistent history).
7. Ensure green checks before merge.

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
Real closed example: https://github.com/Netcracker/qubership-workflow-hub/pull/293
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

---
## 11. After Merge
| Action | When |
|--------|------|
| Close related issues (auto if Fixes used) | Immediately |
| Update release notes / changelog | On merge of feature / fix |
| Tag new version (if action changed) | After merge & validation |
| Communicate deprecation (if applicable) | Before tag / release |

---
## 12. Support
Questions about this process: open an issue with label `type:docs` or ask maintainers directly.

Consistent PR hygiene keeps review cycles short and quality high.
