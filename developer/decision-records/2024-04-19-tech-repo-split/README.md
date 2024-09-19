# Decision: Separate build pipelines for Technology Repositories

## Definition of terms

For the purposes of this document, the following definition of terms apply:

- "technology": refers to code in EDC extensions implementing specific services of a particular CSP, for
  example Amazon S3
- "technology repository": EDC repositories that host these technology extension.
- CSP: cloud solution provider, such as Microsoft (Azure), Google (GCP) or Amazon (AWS)

## Decision

We will separate the build and release pipelines for the technology repositories. That means continuous builds,
nightly builds, and release builds can technically happen separately from the core components builds.

To achieve that, every technology repository will get its own Maven sub-group-id:

- Technology-Azure: `org.eclipse.edc.azure`
- Technology-Aws: `org.eclipse.edc.aws`
- Technology-Gcp: `org.eclipse.edc.gcp`
- (Technology-Huawei: `org.eclipse.edc.huawei`)

As a convention, the version numbering across _all_ repositories will remain consistent.

## Rationale

Maintenance and upkeep for the technology repositories is currently handled by the committers of the EDC project, for
whom this has become a substantial time and resources investment.
In an effort to re-allocate these resources to the core components, we want to decouple the release processes of the
Technology repositories. That way, when the builds fail, for example due to a breaking change in an SPI, or some other
compile-time or run-time problem, the release of the core components is not blocked.

In addition, a process should be started to create dedicated specialist teams in those cloud provider companies, who
over time build trust with the community and gain traction with the project, so that they can eventually take over the
maintenance for the technology repositories. This will also help bolster and foster the community of EDC.

It is understood that that is a lengthy process, but one that should start sooner rather than later.

## Approach

Several things are necessary to achieve that modularization:

- removing the technology repositories from the build scripts in the Release repository. This will exclude them from the
  nightly and release builds.
- add Maven sub-group-ids
- create a GitHub workflow that publishes to OSSRH Staging / MavenCentral, bumps versions, etc.
