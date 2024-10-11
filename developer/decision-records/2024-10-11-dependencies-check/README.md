# Dependencies Check

## Decision

We will remove the `DEPENDENCIES` files from the repositories and publish them to GitHub Pages.
The actual check for "restricted"/"rejected" dependencies the file won't happen on every PR, but it will be a 
pre-requisite for every release.

## Rationale

The "dependencies check" that is running for every PR opened is an hassle for contributors, especially new ones, slowing
down them, but the [Eclipse Foundation Project Handbook](https://www.eclipse.org/projects/handbook) does not explicitly
says that the file must be checked in with the code, but, in the [Notice Files](https://www.eclipse.org/projects/handbook/#legaldoc-notice)
section:
> The notice file must include [...], **information regarding the licensing of any third party content**, [...]

Currently, in the `NOTICE.md` file there's a link pointing to the checked in `DEPENDENCIES` file.

Keeping the file published separated from the code will keep us compliant with the handbook and save us a lot of time.
The file will be checked in only in release/bugfix branches, and it will be valid (without any `restricted`/`rejected`
dependency)

## Approach

The targeted repositories are the ones that publish artifacts to Maven Central:
- `Runtime-Metamodel`
- `GradlePlugins`
- `Connector`
- `IdentityHub`
- `FederatedCatalog`
- `Technology-*` (all of them)

### Main branch

Every one of this repositories will need to have: 
- the GitHub Pages enabled
- a new action workflow that for every commit on main branch generates and publishes the `DEPENDENCIES` file on the root
  folder in the Pages (overriding the past one).
- `NOTICE.md` file should contain a link to that published file
- dependencies check removed from the `verify.yaml` workflow

### Releases/Bugfixes

These steps need to happen in the preparation phase:
- generate the DEPENDENCIES file
- check if it contains `restricted` or `rejected` dependencies, if it does, the workflow will fail
- the file is checked in and linked correctly in the `NOTICE.md` file

So the DEPENDENCIES file related to a release/bugfix will be checked in with the code and not published, mainly because
it will be easier for the release process, as there are no changes needed to the current workflow, plus, it makes sense
to have the snapshot of the DEPENDENCIES attached to the release tag.
