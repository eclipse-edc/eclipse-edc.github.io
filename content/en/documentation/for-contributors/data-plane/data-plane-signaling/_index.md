---
title: Data plane integration
weight: 20
---

<!-- TOC -->
  * [1. Overview](#1-overview)
  * [2. Data plane registration](#2-data-plane-registration)
  * [3. Data plane selection](#3-data-plane-selection)
    * [3.1 Building the catalog](#31-building-the-catalog)
    * [3.2 Selecting a data plane for a transfer](#32-selecting-a-data-plane-for-a-transfer)
  * [4. Signaling](#4-signaling)
    * [4.1 Signals sent to the data plane](#41-signals-sent-to-the-data-plane)
    * [4.2 Notifications from the data plane](#42-notifications-from-the-data-plane)
    * [4.3 The data address](#43-the-data-address)
  * [5. Authorization profiles](#5-authorization-profiles)
<!-- TOC -->

## 1. Overview

The control plane integrates data planes through the
[Data Plane Signaling (DPS)](https://eclipse-dataplane-signaling.github.io/dataplane-signaling) protocol, implemented by
the `data-plane-signaling` modules (`data-protocols/data-plane-signaling`):

- `data-plane-signaling-core`: the registration API, the signaling client, the `DataFlowController` that drives the data
  planes for the transfer process state machine, and the Signaling API that receives the data planes' notifications;
- `data-plane-signaling-oauth2` and `data-plane-signaling-oauth2-token-exchange`: the authorization profiles
  `oauth2_client_credentials` and `oauth2_token_exchange` (see [5. Authorization profiles](#5-authorization-profiles)).

The control plane doesn't move data and doesn't create data addresses: it decides _which_ data plane handles a transfer
and _when_, the data plane decides _how_.

## 2. Data plane registration

The life cycle of a data plane is decoupled from the one of the control plane: data planes can be added, replaced or
removed at any time. A data plane _registers_ with the control plane through the Management API:

- `PUT /v4/dataplanes` and `DELETE /v4/dataplanes/{dataplaneId}`;
- `PUT /v5/participants/{participantContextId}/dataplanes` and `DELETE /v5/participants/{participantContextId}/dataplanes/{dataplaneId}`,
  which register the data plane for one participant context and need the scope `management-api:dataplanes:write`.

The request body is a plain JSON object:

```json
{
  "dataplaneId": "dataplane-1",
  "endpoint": "https://dataplane.internal/api/signaling",
  "transferTypes": [ "HttpData-PULL", "HttpData-PUSH" ],
  "labels": [ "eu" ],
  "authorization": {
    "type": "oauth2_client_credentials",
    "tokenEndpoint": "https://idp.internal/token",
    "clientId": "control-plane",
    "clientSecret": "...",
    "jwksUri": "https://idp.internal/jwks"
  }
}
```

- `dataplaneId`: the id of the data plane, unique per participant context. Registering the same id again replaces the
  registration, so a data plane can register on every start.
- `endpoint`: the base URL of the data plane's DPS API, to which the control plane sends the signals.
- `transferTypes`: the transfer types (DPS profiles) the data plane supports.
- `labels`: free-form labels that assets and transfer requests can require of the data plane (see
  [3.2](#32-selecting-a-data-plane-for-a-transfer)).
- `authorization`: optional, the authorization profile with which the control plane and the data plane authenticate to
  each other (see [5. Authorization profiles](#5-authorization-profiles)).

A registered data plane is a _logical_ instance: replicas of a data plane share one registration, behind one endpoint.
The control plane doesn't check whether a data plane is available, that is the job of the infrastructure (e.g. replicas
behind a load balancer). The registrations are persisted (`edc.sql.store.dataplaneinstance.datasource` for the SQL
store), so that all the control plane replicas see them.

## 3. Data plane selection

### 3.1 Building the catalog

The transfer types offered for an asset in the catalog, as `Distribution`s, come from the registered data planes of the
participant context:

- if the asset's `dataplaneMetadata` lists no `profiles`, the transfer types of all the registered data planes;
- otherwise, the transfer types of the data planes that support at least one of the listed profiles.

For example, if one data plane supports `HttpData-PULL` and another `AmazonS3-PUSH`, an asset without profiles is offered
with both.

### 3.2 Selecting a data plane for a transfer

When a transfer process is prepared (consumer) or started (provider), the control plane selects a data plane that:

- is registered for the participant context of the transfer process;
- supports the transfer type of the transfer process;
- has all the labels of the transfer process's `dataplaneMetadata`. The provider takes them from the asset, the consumer
  from the transfer request.

If several data planes match, the selection strategy picks one: `random` by default, set with
`edc.dataplane.client.selector.strategy`. Extensions can add strategies through the `SelectionStrategyRegistry`. The id of
the selected data plane is stored on the transfer process, and all later signals go to that data plane.

## 4. Signaling

The `DataPlaneSignalingFlowController` is the `DataFlowController` of the control plane: the transfer process state
machine calls it at each step, and it sends the corresponding DPS message to the data plane with the
`DataPlaneSignalingClient`. The messages and their payloads are defined by the
[DPS specification](https://eclipse-dataplane-signaling.github.io/dataplane-signaling); the transfer type of the
transfer process is sent as the `profile`, together with the `labels` and the `metadata` (properties) of its
`dataplaneMetadata`.

### 4.1 Signals sent to the data plane

| Transfer process step | Side | DPS call |
|---|---|---|
| INITIAL | consumer | `POST {endpoint}/prepare` |
| STARTING | provider | `POST {endpoint}/start` |
| STARTED received from the provider | consumer | `POST {endpoint}/{flowId}/started` |
| SUSPENDING | both | `POST {endpoint}/{flowId}/suspend` |
| RESUMING | both | `POST {endpoint}/{flowId}/resume` |
| TERMINATING | both | `POST {endpoint}/{flowId}/terminate` |
| COMPLETED received from the counter-party | both | `POST {endpoint}/{flowId}/completed` |

The `flowId` is the id of the transfer process.

A data plane answers `prepare`, `start` and `resume` either synchronously, with the final state of the data flow (e.g.
`STARTED`) and possibly a data address, or asynchronously, with a pending state (e.g. `STARTING`). In the asynchronous
case, the transfer process waits in `PREPARATION_REQUESTED` or `STARTUP_REQUESTED` until the data plane notifies the
control plane.

### 4.2 Notifications from the data plane

The data plane notifies the control plane through the Signaling API, a dedicated API context
(`web.http.signaling.port`, default `8182`, and `web.http.signaling.path`, default `/api/signaling`):

- `POST /transfers/{transferId}/dataflow/prepared`: an asynchronous `prepare` is done, with the data address if any;
- `POST /transfers/{transferId}/dataflow/started`: an asynchronous `start` is done, with the data address if any;
- `POST /transfers/{transferId}/dataflow/completed`: the data flow is complete, the control plane completes the transfer
  process and notifies the counter-party;
- `POST /transfers/{transferId}/dataflow/errored`: the data flow failed for good. As defined by DPS, the transfer
  process doesn't change state and the counter-party is not notified: the control plane logs the error and emits the
  event `transfer.process.dataflow.errored`, with the error, so that callbacks or operators can decide how to recover,
  e.g. by terminating the transfer process or starting a new one.

The data plane must be configured with the URL of this API: the control plane doesn't send it in the `prepare` and
`start` messages.

### 4.3 The data address

The data address carries what the counter-party needs to access the data flow, e.g. an endpoint and a token. It is created
and used only by the data planes; the control plane stores it and passes it on through the Dataspace Protocol:

- **pull:** the provider data plane returns the data address in its `start` response (or `started` notification). The
  provider control plane sends it to the consumer in the DSP `TransferStartMessage`, and the consumer control plane hands
  it to its data plane with `started`.
- **push:** the consumer data plane returns the destination as data address in its `prepare` response (or `prepared`
  notification). The consumer control plane sends it in the DSP `TransferRequestMessage`, and the provider control plane
  passes it to its data plane in the `start` message.

## 5. Authorization profiles

The `authorization` object of the registration selects how the control plane authenticates its signals to the data plane,
and how it authenticates the data plane's notifications:

- `oauth2_client_credentials` (`data-plane-signaling-oauth2`): the control plane gets a token with the client credentials
  (`tokenEndpoint`, `clientId`, `clientSecret`) for its signals, and validates the tokens of the notifications against
  `jwksUri` or `jwks`.
- `oauth2_token_exchange` (`data-plane-signaling-oauth2-token-exchange`): the control plane exchanges its workload
  credential (by default the Kubernetes service account token, `edc.dps.oauth2.tokenexchange.subjecttokenpath`) for a
  token at `tokenExchangeEndpoint`; the notifications are validated against the `issuer` and `jwksUri` or `jwks` of the
  profile.

Without an `authorization` object the signals and the notifications are not authenticated. The control plane logs a
warning when such a data plane registers, see
[Securing the Signaling API](../../../for-adopters/data-plane/_index.md#securing-the-signaling-api). The authorization profiles are
defined in the [DPS profiles](https://eclipse-dataplane-signaling.github.io/profiles); further ones can be added by
extensions through the `SignalingAuthorizationRegistry`.
