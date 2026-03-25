# Moving Samples and documentation to a new "Dataspace Hub" project

## Decision

A new project tentatively titled "Eclipse Dataspace Hub" will be created with the purpose of housing documentation and sample code. This includes EDC's documentation and samples, but also that of other projects such as `eclipse-cfm` and `eclipse-dataplane-core` and potentially others.

## Rationale

Moving documentation and sample code to a dedicated space has several advantages:

- discoverability: Dataspace Hub can serve as single port-of-entry for developers new to the dataspace world. No need to go hunting in multiple projects, orgs or repos for information.
- dependencies: code in the Dataspace Hub project will only have upstream dependencies, e.g. onto EDC, the dataplane SDKs etc.
- focused community: the barrier of entry for developers interested in becoming contributors is lower. At the same time it is a more digestible way to get familiar with the code base.

## Approach

### (Re-)move samples

All samples, that are focused on data transfers will have to be adapted to reflect the use of Dataplane SDKs or the "Siglet". Samples should show how to implement a dataplane rather than "how to use transmission technology X". They become showcases of the SDKs or the Siglet rather than a specific wire protocol.

Other samples (`basic/` and `advanced/`) can remain and need only be moved.

### Adapt MVD and JAD

In addition to specific small samples we will continue to offer larger end-to-end samples, specifically:

- MVD: showcases a dataspace using the "classic" (single-tenant) configuration of EDC with only extremely rudimentary data transfer capabilities.
- JAD: showcases a dataspace using the "virtualized" (multi-tenant) configuration of EDC including the Connector Fabric Manager (CFM), an API facade ("redline") and possibly even a web UI.

MVD will need to be refactored in the following aspects:

- remove Terraform/OpenTofu, use plain Kubernetes manifests instead
- simplify participants: only one provider and one consumer, remove management domains
- align naming with JAD
- remove IntelliJ deployment: while this has proven to be useful in the past, it increases maintenance churn, complicates the sample and can almost entirely be replaced with in-cluster debugging.

### Consolidate documentation

The EDC documentation should get merged with other documentation repositories to become the "Dataspace Hub Documentation" that includes CFM, the dataplane signaling SDKs, etc.

_Note: the term "Dataspace Hub is a working title and is open for discussion_
