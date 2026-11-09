---
title: Building a data plane
weight: 30
---

<!-- TOC -->
  * [1. Where to start](#1-where-to-start)
  * [2. What a data plane implements](#2-what-a-data-plane-implements)
    * [2.1 Registration](#21-registration)
    * [2.2 The DPS endpoints](#22-the-dps-endpoints)
    * [2.3 Data addresses and credentials](#23-data-addresses-and-credentials)
    * [2.4 Notifications](#24-notifications)
  * [3. Testing against the EDC control plane](#3-testing-against-the-edc-control-plane)
<!-- TOC -->

A data plane is any application that implements the
[Data Plane Signaling (DPS)](https://eclipse-dataplane-signaling.github.io/dataplane-signaling) protocol and registers
with the control plane. It can be written in any language and run anywhere the control plane can reach it. This page
describes what the EDC control plane expects of it; the protocol itself is defined by the specification.

## 1. Where to start

- **Use an existing data plane.** [`siglet`](https://github.com/eclipse-dataplane-core/siglet),
  from the Data Plane Core project, is driven by DPS and issues, verifies and renews the access tokens of the data flows,
  so that existing APIs and data infrastructure can serve the data.
- **Build one with a Data Plane SDK.** The [Data Plane SDKs](https://github.com/eclipse-dataplane-core) implement the
  DPS endpoints, the data flow state machine and its persistence, and leave the transfer itself to your code:
  [Java](https://github.com/eclipse-dataplane-core/dataplane-sdk-java),
  [Go](https://github.com/eclipse-dataplane-core/dataplane-sdk-go),
  [Rust](https://github.com/eclipse-dataplane-core/dataplane-sdk-rust).
- **Implement the specification directly**, if no SDK fits.

The transfer types a data plane supports are DPS profiles; the common ones are listed in the
[DPS profiles](https://eclipse-dataplane-signaling.github.io/profiles). A data plane can also define profiles of its own,
as long as the participants of a dataspace agree on them.

## 2. What a data plane implements

### 2.1 Registration

At startup, the data plane registers with the control plane, with its id, its DPS endpoint, the transfer types it
supports, its labels and its authorization profile. Registration is idempotent, so the data plane can register on every
start; it deregisters only when it is removed for good. The API and the payload are described in
[Data plane registration](./data-plane-signaling/_index.md#2-data-plane-registration).

All the replicas of a data plane register with the same id and endpoint: the control plane sends the signals of a data
flow to that endpoint, and any replica must be able to handle them, so the data flows are kept in a store shared by the
replicas.

### 2.2 The DPS endpoints

The control plane calls the endpoints defined by the specification, relative to the registered endpoint (see
[Signals sent to the data plane](./data-plane-signaling/_index.md#41-signals-sent-to-the-data-plane)):

- `prepare` (consumer side) and `start` (provider side) create the data flow, whose id is the id of the transfer
  process. They receive the `profile` (the transfer type), the agreement and dataset ids, the participants, and the
  `labels` and `metadata` of the asset or transfer request; the `metadata` carries what the data plane needs to find the
  data, e.g. the URL of the backend of an HTTP asset.
- `{flowId}/started` (consumer side) hands over the provider's data address of a pull transfer.
- `{flowId}/suspend`, `{flowId}/resume`, `{flowId}/terminate` and `{flowId}/completed` change the state of the data flow.

Every call can be repeated: the control plane retries a signal whose response it didn't receive, so a data plane answers
a repeated call with the current state of the data flow instead of an error.

A data plane can answer `prepare`, `start` and `resume` synchronously, with the final state, or asynchronously, with a
pending state, and notify the control plane later (see [2.4 Notifications](#24-notifications)). An asynchronous answer
fits work that takes time, e.g. provisioning a bucket or a queue for the transfer.

### 2.3 Data addresses and credentials

The data plane creates the data address of a transfer and the credentials in it, and validates them when the
counter-party uses them; the control plane only passes them on:

- **pull:** the provider data plane returns, in its `start` answer, the endpoint and the token at which the consumer
  fetches the data, and accepts requests with that token until the data flow is suspended, terminated or completed.
- **push:** the consumer data plane returns, in its `prepare` answer, the destination the provider pushes the data to; the
  provider data plane receives it in the `start` message.

### 2.4 Notifications

The data plane reports the progress of a data flow to the control plane's Signaling API: `prepared` and `started` after an
asynchronous answer, `completed` when a finite transfer is done, `errored` when it failed (see
[Notifications from the data plane](./data-plane-signaling/_index.md#42-notifications-from-the-data-plane)). The URL of the
Signaling API is part of the data plane's configuration. With an authorization profile, the data plane authenticates
these calls, and validates the control plane's signals, as the profile defines (see
[Authorization profiles](./data-plane-signaling/_index.md#5-authorization-profiles)).

## 3. Testing against the EDC control plane

The Connector's end-to-end transfer tests use a data plane built with the Java SDK
(`system-tests/e2e-transfer-test/signaling-data-plane` in the
[Connector repository](https://github.com/eclipse-edc/Connector)): it shows a registration, the handling of the
signals, and pull and push transfers between two control planes, and can serve as a starting point for tests of your own
data plane.
