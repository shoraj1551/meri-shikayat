# Branching Strategy & Deployment Pipeline

## Branch Structure

Our project follows a three-tier branching strategy to ensure code quality and controlled deployments:

```
dev → UAT → main
```

### Branch Descriptions

#### 1. **dev** (Development Branch)
- **Purpose**: Active development and feature integration
- **Stability**: Unstable, frequent changes
- **Testing**: Unit tests and basic integration tests
- **Deployment**: Development environment (localhost)
- **Access**: All developers can commit directly

#### 2. **uat** (User Acceptance Testing Branch)
- **Purpose**: Pre-production testing and validation
- **Stability**: Stable, tested features only
- **Testing**: Full integration tests, UAT, and QA validation
- **Deployment**: UAT/Staging environment
- **Access**: Merge from dev only after code review

#### 3. **main** (Production Branch)
- **Purpose**: Production-ready code
- **Stability**: Highly stable, thoroughly tested
- **Testing**: All tests passed, UAT approved
- **Deployment**: Production environment
- **Access**: Merge from UAT only after approval

---

## Merge Pipeline

### Stage 1: Development → UAT

**Trigger**: When features are complete and tested in dev

**Process**:
1. Ensure all changes are committed to `dev` branch
2. Run all tests locally
3. Create a Pull Request (PR) from `dev` to `uat`
4. Code review by team lead or senior developer
5. Merge to `uat` after approval

**Commands**:
```bash
# Ensure you're on dev branch
git checkout dev
git pull origin dev

# Create PR or merge directly (if approved)
git checkout uat
git pull origin uat
git merge dev
git push origin uat
```

**Approval Criteria**:
- ✅ All unit tests passing
- ✅ Code review completed
- ✅ No critical bugs
- ✅ Feature documentation updated

---

### Stage 2: UAT → Production (main)

**Trigger**: After successful UAT and stakeholder approval

**Process**:
1. Deploy `uat` branch to staging environment
2. Conduct User Acceptance Testing
3. Stakeholder review and sign-off
4. Create a Pull Request from `uat` to `main`
5. Final review by project owner
6. Merge to `main` after approval
7. Tag the release with version number

**Commands**:
```bash
# Ensure UAT is tested and approved
git checkout uat
git pull origin uat

# Merge to main
git checkout main
git pull origin main
git merge uat

# Tag the release
git tag -a v0.006 -m "Release v0.006: Admin Dashboard Enhancement & Notification System"
git push origin main --tags
```

**Approval Criteria**:
- ✅ All integration tests passing
- ✅ UAT completed successfully
- ✅ Stakeholder approval obtained
- ✅ No blocking issues
- ✅ Release notes prepared
- ✅ Rollback plan documented

---

## Workflow Diagram

```
┌─────────────┐
│     dev     │  ← Active development
│  (unstable) │
└──────┬──────┘
       │ PR + Code Review
       │ ✓ Tests passing
       ▼
┌─────────────┐
│     uat     │  ← Testing & validation
│  (stable)   │
└──────┬──────┘
       │ PR + UAT Approval
       │ ✓ Stakeholder sign-off
       ▼
┌─────────────┐
│    main     │  ← Production
│ (very stable)│
└─────────────┘
```

---

## Branch Protection Rules

### For `uat` branch:
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict who can push to matching branches

### For `main` branch:
- Require pull request reviews before merging (minimum 2 approvers)
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict who can push to matching branches
- Require signed commits (optional)

---

## Hotfix Process

For critical production issues:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/issue-description

# Make fixes and test
# ... fix code ...

# Merge to main
git checkout main
git merge hotfix/issue-description
git tag -a v0.006.1 -m "Hotfix: Issue description"
git push origin main --tags

# Merge back to uat and dev
git checkout uat
git merge hotfix/issue-description
git push origin uat

git checkout dev
git merge hotfix/issue-description
git push origin dev

# Delete hotfix branch
git branch -d hotfix/issue-description
```

---

## Release Process

### Version Numbering
We follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

**Before Merging to UAT**:
- [ ] All features tested locally
- [ ] Unit tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

**Before Merging to Main**:
- [ ] UAT environment deployed
- [ ] Integration tests passing
- [ ] User acceptance testing completed
- [ ] Stakeholder approval obtained
- [ ] Release notes prepared
- [ ] Database migrations tested (if any)
- [ ] Rollback plan documented
- [ ] Production deployment plan ready

**After Merging to Main**:
- [ ] Tag the release
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Notify stakeholders
- [ ] Update project board
- [ ] Archive old releases

---

## Environment Configuration

### Development (dev branch)
- **URL**: http://localhost:3000
- **Database**: MongoDB local instance
- **API**: http://localhost:5000

### UAT (uat branch)
- **URL**: https://uat.merishikayat.com (to be configured)
- **Database**: MongoDB staging instance
- **API**: https://api-uat.merishikayat.com

### Production (main branch)
- **URL**: https://merishikayat.com (to be configured)
- **Database**: MongoDB production instance
- **API**: https://api.merishikayat.com

---

## CI/CD Integration (Future)

When setting up CI/CD pipelines:

### GitHub Actions / GitLab CI

```yaml
# Example workflow
on:
  pull_request:
    branches: [uat, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

### Automated Deployments
- **dev → Development**: Auto-deploy on push
- **uat → Staging**: Auto-deploy on merge
- **main → Production**: Manual deployment after approval

---

## Best Practices

1. **Never commit directly to `main`**: Always go through the pipeline
2. **Keep branches in sync**: Regularly merge `main` → `uat` → `dev` to avoid conflicts
3. **Use descriptive commit messages**: Follow conventional commits format
4. **Tag all releases**: Use semantic versioning for tags
5. **Document breaking changes**: Update migration guides
6. **Test thoroughly**: Each stage should have appropriate testing
7. **Communicate**: Notify team about merges and deployments

---

## Quick Reference

```bash
# Check current branch
git branch

# Switch to branch
git checkout <branch-name>

# Create new branch
git checkout -b <branch-name>

# Merge branch
git merge <source-branch>

# Push to remote
git push origin <branch-name>

# Pull latest changes
git pull origin <branch-name>

# View merge history
git log --graph --oneline --all
```

---

## Support

For questions about the branching strategy or deployment pipeline, contact the project maintainer.

**Last Updated**: December 3, 2025
