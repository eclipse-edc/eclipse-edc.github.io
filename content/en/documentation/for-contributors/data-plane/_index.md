---
title: Data Plane
weight: 70
---

EDC doesn't contain a data plane. A data plane is a separate application that transfers the data, and the EDC control
plane directs it through the
[Data Plane Signaling (DPS)](https://eclipse-dataplane-signaling.github.io/dataplane-signaling) protocol: the control
plane handles the Dataspace Protocol, the contracts and the policies, the data plane handles the transfer itself,
including the data address and the credentials of the data flow.

Any application that implements DPS and registers with the control plane can be a data plane: one built with the
[Data Plane SDKs](https://github.com/eclipse-dataplane-core), an existing one such as
[`siglet`](https://github.com/eclipse-dataplane-core/dsdk-facet-rs/tree/main/siglet), or one written directly on the
specification.

This section covers:

- [Data plane integration](./data-plane-signaling/_index.md): how the control plane registers and selects data planes, sends them
  signals and receives their notifications;
- [Building a data plane](./custom-data-plane.md): what a data plane implements, and where to start.

Up to version 0.18, EDC contained the *Data Plane Framework* (`DataPlaneManager`, `PipelineService`, `DataSource` and
`DataSink`) and a data plane built on it. Both were removed in favour of DPS; the
[migration guide](/blog/2026/05/19/data-plane-migration/) describes how to move to DPS data planes.
