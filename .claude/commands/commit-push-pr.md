# Commit, Push, and Create PR

Perform a complete git workflow to ship the current changes:

## Steps

1. **Review changes**: Run `git status` and `git diff` to understand what's being committed
2. **Branch**: Check the current branch with `git branch --show-current`
   - If on `main` or `develop`: create and switch to a new feature branch named after the changes (e.g. `feat/short-description`)
   - If already on a feature branch: continue on the current branch
3. **Stage files**: Add relevant files (exclude secrets, logs, temp files)
4. **Commit**: Use conventional commit format
5. **Push**: Push to the current branch with `-u` flag if needed
6. **Create PR**: Use `gh pr create` with:
   - Clear title summarizing the change
   - Description with summary bullets

## Commit Message Format

<type>: <short description>

<optional body explaining the change>

## PR Description Format

## Summary

- [Key change 1]
- [Key change 2]

Execute all steps and report the PR URL when complete.
