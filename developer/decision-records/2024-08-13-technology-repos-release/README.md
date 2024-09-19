# Technology Repositories Release

## Decision

Release of a "Technology" repository need a separate and well-defined release process.

## Rationale

"Technology" repository release happens after the completion of the "core" release. This is true both for new releases
and bugfixes.

## Approach

The process will slightly differ between:
- `release` (new features with a `x.y.0` version number)
- `bugfix` (only bugfix with a `x.y.z` version number, with `z` greater than 0, starting from a previously existing release branch)

### Prepare release
There will be a `prepare-release` job on every `Technology` repo with these inputs:
- version number to be released
- starting branch (`main` by default)

The workflow will:
- set the core dependency version number to the one passed in input
- set the project version number to the one passed in input
- create a temporary `prepare/x.y.z` branch
- commit
- create a PR from `prepare/x.y.z` to `release|bugfix/x.y.z`

The PR will take care to run all the checks (tests, dependencies, ...) and will give to the committers the opportunity to
eventually cherry-pick commits for a `bugfix` release.

### Release

When the preparation PR gets merged there will be an automated workflow that gets triggered on push on a `release/` or `bugfix/` branch.
Such flow will:
- publish artifacts on maven central
- create `vx.y.z` git tag
- create github release
- send a message on the discord channel.
- \[only for `release`, not for `bugfix`\] bump version to next snapshot

note that the `releases` branch is not involved by this process. In fact, at this point it does not make sense to maintain it.

These workflows will be created as reusable in the `.github` repository and then referenced in every `Technology` repository.
