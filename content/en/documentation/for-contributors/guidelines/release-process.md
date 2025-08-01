---
title: Release process
weight: 100
---

EDC is a set of java modules, that are released all together as a whole with a single version number across all the
different code repositories, that are, to date:
- [Runtime-Metamodel](https://github.com/eclipse-edc/Runtime-Metamodel)
- [GradlePlugins](https://github.com/eclipse-edc/GradlePlugins)
- [Connector](https://github.com/eclipse-edc/Connector)
- [IdentityHub](https://github.com/eclipse-edc/IdentityHub)
- [FederatedCatalog](https://github.com/eclipse-edc/FederatedCatalog)
- [Technology-Aws](https://github.com/eclipse-edc/Technology-Aws)
- [Technology-Azure](https://github.com/eclipse-edc/Technology-Azure)
- [Technology-Gcp](https://github.com/eclipse-edc/Technology-Gcp)
- [Technology-HuaweiCloud](https://github.com/eclipse-edc/Technology-HuaweiCloud)

> Note: the `Technology` repositories are not considered part of the core release and the committer group is not accountable
> for unreleased versions of those components.

The released artifacts are divided in 3 categories:
- [Proper releases](#1-proper-releases)
- [Nightly builds](#2-nightly-builds)
- [Snapshots](#3-snapshots)

We follow a [TBD](https://trunkbaseddevelopment.com/) approach, in which we always work in `main` and we use short-lived 
branches. Releases are branches that go on their own and never get merged back in `main`.

## 1. Proper releases

The EDC official release artifacts are published on [Maven Central](https://central.sonatype.com/).
A release happens about once every 2 months, but the timeframe could slightly vary.
Bugfix versions can also happen in cases of hi-level security issues or in the case any of the committers for any reason
commits to release one. Generally speaking, as committer group **we don't maintain versions older than the latest**, but
nothing stops any committer to do that, but the general advice is always to keep up-to-date with the latest version.

Our release process is managed centrally in the [Release](https://github.com/eclipse-edc/Release) repository, in particular
with the 2 workflows:
- [prepare-release](https://github.com/eclipse-edc/Release/actions/workflows/prepare-release.yml) has as inputs:
  - use workflow from: always `main`
  - `release version`: is the semantic version that will be applied to the release, e.g. `0.14.0`
  - `source branch`: is the branch from which the release branch will detach. for proper releases set `main`, for bugfixes indicate the starting branch
  
  for example, if we're about to release a bugfix we will put `release version` as `0.14.1` and `source branch` as `release/0.14.0`. \
  the workflow will execute the [`prepare-release` workflow](https://github.com/eclipse-edc/.github/blob/main/.github/workflows/prepare-release.yml)
  on every repository following the correct order that's defined in the `.github` repository, and it:
  - sets the project version as `x.y.z-SNAPSHOT` - this is required to permit compilation and tests to work in between the `prepare release` and the `release` phases
  - commits the change in the specified branch, creating it if necessary (generally speaking it should create it because
    it should not exist, but this way it'll be able to manage re-triggers of the workflow if needed)
  - if the `source branch` is `main`, it bumps the version number there to the next snapshot version, to let the development
    cycle flow there
  - if the `source branch` is not `main`, we're preparing a bugfix version, so the workflow will publish the snapshot version
    of the artifacts. no need to do it for `main` because these will already exists as published on every commit on the `main`
    branch
- [release](https://github.com/eclipse-edc/Release/actions/workflows/release.yml) has as inputs:
  - use workflow from: always `main`
  - `source branch`: the branch from which the release workflow will start, e.g. `release/0.14.0` or `bugfix/0.14.1`

  so, if in the `prepare-release` we passed `source branch` as `release/0.14.0` it means that the `bugfix/0.14.1` has been
  created on all the repository, this means that `bugfix/0.14.1` will be the `source branch` of our `release` workflow. \
  the workflow will execute the [`prepare-release` workflow](https://github.com/eclipse-edc/.github/blob/main/.github/workflows/release.yml)
  on every repository following the correct order that's defined in the `.github` repository, and it:
  - sets the release version (withouth the `-SNAPSHOT` suffix)
  - generate `DEPENDENCIES` file in strict mode (it fails if any `restricted` or `rejected` dependency is found)
  - executes `./gradlew build` on the repository, enabling all tests to run, excluding eventually tags that represent
    tests that are meant not to run on every commit
  - publish the artifacts on maven central
  - commits the changes (release version, DEPENDENCIES file) and tag the commit with the version number
  - creates GitHub release
  - waits for published artifacts to be available on maven central. this is necessary because it could take 15-30-45 minutes
    to have the artifacts available. Without this job, the next repositories will fail in compiling the project because
    the upstream dependencies will be missing.

## 2. Nightly builds
Every night we publish every artifact as a `-SNAPSHOT` with a date information, e.g. `0.14.0-20250801-SNAPSHOT`.
The workflow is also stored in the `Release` repo and it's pretty similar to the `release` ones, but the version is, as
said, set as a nightly snapshot one.

The snapshots are published on the dedicated central snapshot repository. [More info on the Central website](https://central.sonatype.org/publish/publish-portal-snapshots/#consuming-snapshot-releases-for-your-project).
Note that `-SNAPSHOT` versions get cleaned up after 90 days ([ref.](https://central.sonatype.org/publish/publish-portal-snapshots/#publishing-snapshot-releases))

## 3. Snapshots
In every repository on every commit on the `main` branch we release a `-SNAPSHOT` version of the upcoming release, e.g.
before release `0.14.0` we will release `0.14.0-SNAPSHOT` snapshots.
Every new `SNAPSHOT` published after a new commit on `main` will override the previous one.
As said before, these versions get cleaned up after 90 days ([ref.](https://central.sonatype.org/publish/publish-portal-snapshots/#publishing-snapshot-releases))
