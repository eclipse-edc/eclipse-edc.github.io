---
title: Data Plane migration
date: 2026-05-19
description: >
  How to adapt to the new Data Plane Signaling protocol implementation 
---

Over the last few months we have invested significant effort adapting the control-plane implementation to the
[Data Plane Signaling specification](https://eclipse-dataplane-signaling.github.io/dataplane-signaling).
We are about to drop the legacy protocol together with the whole EDC-DataPlane implementation.
In this guide we cover the steps needed for teams running EDC-based control-planes that want to upgrade.

**What is changing:** the control-plane no longer manages `DataAddress` directly; that responsibility moves to the
data-plane, which now speaks the DPS protocol. The EDC-DataPlane modules that previously handled this will be removed
from the EDC platform.

## Module changes

### Control-plane

From the control-plane modules point of view, the switch is as easy as:
- exclude `transfer-data-plane-signaling` module
- include `data-plane-signaling` module

Please note that these two modules are not meant to run together, and defining them in the same runtime could lead to
unexpected behavior.

### Data-plane

The current EDC-DataPlane implementation will be removed soon. DPS support will not be added to it before removal, so
downstream projects that still rely on it must fork the codebase and own the implementation going forward.

Data-plane implementations that already speak DPS are expected to emerge, such as
[`siglet`](https://github.com/eclipse-dataplane-core/dsdk-facet-rs/tree/main/siglet).

## Seamless upgrade

The recommended approach for offering assets on the new protocol without disrupting active negotiations and transfers
is a parallel-running strategy: the legacy data-plane and the new DPS data-plane run simultaneously during the
transition period.
The steps below assume your current data-plane is an EDC Data-Plane and must be carried out in order.

### Step 1 — Add DPS support to your data-plane

Your current data-plane implementation must support the Data Plane Signaling protocol alongside the legacy one,
because once the control-plane is switched to DPS it can no longer serve the legacy protocol.
As noted above, the EDC-DataPlane will eventually be removed from the EDC platform.

Required implementation steps:
- Inherit the EDC-DataPlane code in your downstream project by copying the contents of the
  `[core|extensions|spi]/data-plane` folders into your project.
- Implement a shim layer with DPS-compliant endpoints that maps incoming DPS messages to the existing `DataFlow`
  mechanics of the EDC-DataPlane. In particular, `DataAddress` properties must be read from `dataplaneMetadata.properties`
  in DPS requests.
- Implement `TransferProcessApiClient` to support the DPS callback spec (the interface is defined in the DPS
  specification).
- _Optional_: if the data-plane is deployed independently from the control-plane, different `DataFlow`s may carry
  different signaling versions at the same time. To avoid this complexity, we recommend keeping control-plane and
  data-plane deployments in sync during the migration.

### Step 2 — Migrate existing assets on the control-plane

The DPS protocol introduces a substantial change: `DataAddress` is no longer managed by the control-plane but by the
data-plane. This means existing `Asset`s must be updated before the control-plane is switched to the new DPS version.

Required data migrations:
- Move the `dataAddress` properties into the `dataplaneMetadata.properties` object structure.
- Set the transfer type the `Asset` is meant to be offered on in the `dataplaneMetadata.profiles` array. This
  information can be derived by querying existing `TransferProcess` records and collecting their `transferType` values.

### Step 3 — Register both data-planes on the control-plane

The control-plane must have both data-planes registered and selectable. Selection is based on the `transferType`/`profile`
each data-plane declares it supports.

Legacy assets and data-planes will advertise the legacy transfer types such as `HttpData-PULL` and `HttpData-PUSH`,
while the new DPS data-plane will advertise DPS profiles
([follow DPS issue](https://github.com/eclipse-dataplane-signaling/dataplane-signaling/issues/99) for the final
profile definitions).

### Step 4 — Deploy and phase out legacy assets

Once the prerequisites above are in place, deploy all three components together:
- EDC control-plane with DPS support (using the `data-plane-signaling` module)
- Legacy EDC data-plane extended with DPS support (inheriting the EDC-DataPlane code: **this will not be provided by the EDC team**)
- New DPS-native data-plane (such as `siglet`)

The legacy data-plane registers itself with the legacy profiles (`HttpData-PUSH`, `HttpData-PULL`, etc.); the new DPS
data-plane registers itself with the new DPS profiles
([follow DPS issue](https://github.com/eclipse-dataplane-signaling/dataplane-signaling/issues/99)).

Active negotiations and transfers will continue to run on the legacy data-plane uninterrupted. New assets can be
created with `dataplaneMetadata.profiles` pointing to the DPS data-plane. Existing legacy assets can be duplicated
and updated to the new profiles at your own pace.

Legacy and DPS assets can coexist for as long as needed, allowing teams to plan a gradual phase-out of the legacy ones.
The migration is complete when all active transfers have finished and all assets have been moved to DPS profiles.

## Temporary measure, not a target state

Copying the EDC-DataPlane code and building a DPS shim layer on top of it is a **migration aid only**. It exists
to give teams a bridge while transitioning away from the legacy data-plane, not as a long-term architecture.
Maintaining a fork of the removed EDC-DataPlane code carries ongoing cost: you own all future fixes, security patches,
and compatibility work with no upstream support.

The recommended long-term approach is to adopt a data-plane built on the
[Data Plane SDKs](https://github.com/eclipse-dataplane-core) and the DPS protocol natively — for example
[`siglet`](https://github.com/eclipse-dataplane-core/dsdk-facet-rs/tree/main/siglet). These implementations are
designed around the DPS specification from the ground up and are the supported path forward.

Plan to retire the shim-based data-plane as soon as the migration window closes.
