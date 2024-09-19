# New Release process

## Decision

The EDC release process needs to be improved to support bugfix releases.

## Rationale

Currently, the Release process starts from the main branch of every repository and it can be launched only for proper releases.
For bugfix releases, some manual work needs to be done, that should be avoided.

## Approach

By "core repositories" we mean:
- `Runtime-Metamodel`
- `GradlePlugins`
- `Connector`
- `IdentityHub`
- `FederatedCatalog`

Release EDC components should follow a 2-phase process like it was done for [technology repos](../2024-08-13-technology-repos-release):
- preparation
- release

### Preparation phase
By "release preparation" we mean all the preparatory operations that are needed to permit a proper release.
The workflow will take as input the desired version and the branch name to use as starting point.
- a `release/x.y.z` or `bugfix/x.y.z` branch will be created on every core repository.
- the project version, the upstream "edc" dependency and the DEPENDENCIES file will be bumped to `x.y.z-SNAPSHOT`
- "trigger_snapshot" workflow will be called on every core repository following the dependency order

For a bugfix release now it will be possible to backport/cherry-pick the commits needed

### Release
The release flow is the same for `release` and `bugfix` branches.
It will take as an input the branch name from which the flow will be started.

- all the "core repositories" are checked out on the selected branch
- the "root" project is configured, with all the repos set as subprojects
- the project version and the upstream "edc" dependency will be bumped to `x.y.z`
- all the `DEPENDENCIES` files are updated to replace EDC `-SNAPSHOT` versions with proper versions
- `DEPENDENCIES`, `LICENSE` and `NOTICE.md` files are included in the root project
- the root project is built and published to maven central
- a commit is done on every repo and pushed on remote
- release workflow is called on every core repository, it will:
  - push the version tag
  - create the github release
  - bump version on main if the version ended with `.0` (`release/`)
  - publish autodoc if configured
