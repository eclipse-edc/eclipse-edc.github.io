---
title: Modules, Runtimes, and Components
description: An overview of the EDC modularity system.
weight: 20
---

EDC is built on a module system that contributes features as extensions to a runtime. Runtimes are assembled to create a
*component* such as a control plane, a data plane, or an identity hub. A component may be composed of a single runtime
or a set of clustered runtimes:

![modularity](modularity.svg)

The EDC module system provides a great deal of flexibility as it allows you to easily add customizations and target
diverse deployment topologies from small-footprint single-instance components to highly reliable, multi-cluster setups.
The documentation and samples cover in detail how EDC extensions are implemented and configured. At this point, it's
important to remember that extensions are combined into one or more runtimes, which are then assembled into components.

### A Note on Identifiers

The EDC uses identifiers based on this architecture. There are three identifier types: participant IDs, component IDs,
and runtime IDs. A participant ID corresponds to the organization's identifier in a dataspace. This will vary by dataspace
but is often a Web DID. All runtimes of all components operated by an organization - regardless of where they are deployed
- use the same participant ID.

A component ID is associated with a particular component, for example, a control plane or data plane deployment. If an
organization deploys two data planes across separate clusters, they will be configured with two distinct component IDs.
All runtimes within a component deployment will share the same component ID. Component IDs are permanent and survive runtime
restarts.

A runtime ID is unique to each runtime instance. Runtime IDs are ephemeral and do not survive restarts. EDC uses runtime IDs to acquire cluster locks and for tracing, among other things.
