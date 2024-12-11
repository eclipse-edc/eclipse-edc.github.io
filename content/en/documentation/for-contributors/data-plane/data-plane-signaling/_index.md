---
title: Data Plane Signaling interface
weight: 20
---

<!-- TOC -->
  * [1. `DataAddress` and `EndpointDataReference`](#1-dataaddress-and-endpointdatareference)
  * [2. Signaling protocol messages and API endpoints](#2-signaling-protocol-messages-and-api-endpoints)
    * [2.1 `START`](#21-start)
    * [2.2 `SUSPEND`](#22-suspend)
    * [2.3 `TERMINATE`](#23-terminate)
  * [3. Data plane public API](#3-data-plane-public-api)
    * [3.1 Endpoints and endpoint resolution](#31-endpoints-and-endpoint-resolution)
    * [3.2 Public API Access Control](#32-public-api-access-control)
      * [3.2.1 Access Duration](#321-access-duration)
      * [3.2.2 Leaked Access Tokens](#322-leaked-access-tokens)
      * [3.2.3 Access Token Generation](#323-access-token-generation)
      * [3.2.4 Access Token Validation and Revocation](#324-access-token-validation-and-revocation)
    * [3.3 Token expiry and renewal](#33-token-expiry-and-renewal)
  * [4. Data plane registration](#4-data-plane-registration)
  * [5. Data plane selection](#5-data-plane-selection)
    * [5.1 Building the catalog](#51-building-the-catalog)
    * [5.2 Fulfilling data requests](#52-fulfilling-data-requests)
<!-- TOC -->

Data plane signaling (DPS) defines a set of API endpoints and message types which are used for communication between a
control plane and dataplane to control data flows.

## 1. `DataAddress` and `EndpointDataReference`

When the control plane signals to the data plane to start a client pull transfer process, the data plane returns a
`DataAddress`. This is only true for consumer-pull transfers - provider push transfers **do not return** a
`DataAddress`. This `DataAddress` contains information the client can use to resolve the provider's data plane endpoint.
It also contain an access token (cf. [authorization](#52-public-api-authorization)).

This `DataAddress` is returned by the provider control plane to the consumer in a `TransferProcessStarted` DSP message.
Its purpose is to inform the consumer where they can obtain the data, and which authorization token to use.

The `EndpointDataReference` is a data structure that is used on the consumer side to contain all the relevant
information of the `DataAddress` and some additional information associated with the transfer, such as asset ID and
contract ID. Note that is is only the case if the consumer is implemented using EDC.

A transfer process may be `STARTED` multiple times (e.g., after it is temporarily `SUSPENDED`), the consumer may receive
a different `DataAddress` objects as part of each start message. The consumer must **always** create a new `EDR` from
these messages and remove the previous EDR. Data plane implementations may choose to pass the same `DataAddress` or an
updated one.

This start signaling pattern can be used to change a data plane's endpoint address, for example, after a software
upgrade, or a load balancer switch-over.

## 2. Signaling protocol messages and API endpoints

All requests support idempotent behavior. Data planes must therefore perform request de-duplication. After a data plane
commits a request, it will return an ack to the control plane, which will transition the `TransferProcess` to its next
state (e.g., `STARTED`, `SUSPENDED`, `TERMINATED`). If a successful ack is not received, the control plane will resend
the request during a subsequent tick period.

### 2.1 `START`

During the transfer process `STARTING` phase, the provider control plane selects a data plane using the
`DataFlowController` implementations it has available, which will then send a `DataFlowStartMessage` to the data plane.

The control plane (i.e. the `DataFlowController`) records which data plane was selected for the transfer process so that
it can properly route subsequent, start, stop, and terminate requests.

For client pull transfers, the data plane returns a `DataAddress` with an access token.

If the data flow was previously `SUSPENDED`, the data plane may elect to return the same `DataAddress` or create a new
one.

The provider control plane sends a `DataFlowStartMessage` to the provider data plane:

```http request
POST https://dataplane-host:port/api/signaling/v1/dataflows
Content-Type: application/json

{
  "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
  "@id": "transfer-id",
  "@type": "DataFlowStartMessage",
  "processId": "process-id",
  "datasetId": "dataset-id",
  "participantId": "participant-id",
  "agreementId": "agreement-id",
  "transferType": "HttpData-PULL",
  "sourceDataAddress": {
    "type": "HttpData",
    "baseUrl": "https://jsonplaceholder.typicode.com/todos"
  },
  "destinationDataAddress": {
    "type": "HttpData",
    "baseUrl": "https://jsonplaceholder.typicode.com/todos"
  },
  "callbackAddress" : "http://control-plane",
  "properties": {
    "key": "value"
  }
}
```

The data plane responds with a `DataFlowResponseMessage`, that contains the public endpoint, the authorization token and
possibly other information in the form of a `DataAddress`. For more information about how access tokens are generated,
please refer to [this chapter](#52-public-api-access-control).

### 2.2 `SUSPEND`

During the transfer process `SUSPENDING` phase, the `DataFlowController` will send a `DataFlowSuspendMessage` to the
data plane. The data plane will transition the data flow to the `SUSPENDED` state and invalidate the associated access
token.

```http request
POST https://dataplane-host:port/api/signaling/v1/dataflows
Content-Type: application/json

{
  "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
  "@type": "DataFlowSuspendMessage",
  "reason": "reason"
}
```

### 2.3 `TERMINATE`

During the transfer process `TERMINATING` phase, the `DataFlowController` will send a `DataFlowTerminateMessage` to the
data plane. The data plane will transition the data flow to the `TERMINATED` state and invalidate the associated access
token.

```http request
POST https://dataplane-host:port/api/signaling/v1/dataflows
Content-Type: application/json

{
  "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
  "@type": "DataFlowTerminateMessage",
  "reason": "reason"
}
```


## 3. Data plane public API

One popular use case for data transmission is where the provider organization exposes a REST API where consumers can
download data. We call this a "Http-PULL" transfer. This is especially useful for structured data, such as JSON and it
can even be used to model _streaming_ data.

To achieve that, the provider data plane can expose a "public API" that takes REST requests and satisfies them by
pulling data out of a `DataSource` which it obtains by verifying and parsing the `Authorization` token (see [this
chapter](#32-public-api-access-control) for details).

### 3.1 Endpoints and endpoint resolution

### 3.2 Public API Access Control

The design of the EDC Data Plane Framework is based on **non-renewable** access tokens. One access token will be
maintained for the period a transfer process is in the `STARTED` state. This duration may be a single request or a
series of requests spanning an indefinite period of time ("streaming").

Other data plane implementations my chose to support renewable tokens. Token renewal is often used as a strategy for
controlling access duration and mitigating leaked tokens. The EDC implementation will handle access duration and
mitigate against leaked tokens in the following ways.

#### 3.2.1 Access Duration

Access duration is controlled by the transfer process and contract agreement, not the token. If a transfer processes is
moved from the `STARTED` to the `SUSPENDED`, `TERMINATED`, or `COMPLETED` state, the access token will no longer be
valid. Similarly, if a contract agreement is violated or otherwise invalidated, a cascade operation will terminate all
associated transfer processes.

To achieve that, the data plane maintains a list of currently active/valid tokens.

#### 3.2.2 Leaked Access Tokens

If an access token is leaked or otherwise compromised, its associated transfer process is placed in the `TERMINATED`
state and a new one is started. In order to mitigate the possibility of ongoing data access when a leak is not
discovered, a data plane may implement token renewal. Limited-duration contract agreements and transfer processes may
also be used. For example, a transfer process could be terminated after a period of time by the provider and the
consumer can initiate a new process before or after that period.

#### 3.2.3 Access Token Generation

When the `DataPlaneManager` receives a `DataFlowStartMessage` to start the data transmission, it uses the
`DataPlaneAuthorizationService` to generate an access token (in JWT format) and a `DataAddress`, that contains the
follwing information:

- `endpoint`: the URL of the public API
- `endpointType`: should be `https://w3id.org/idsa/v4.1/HTTP` for HTTP pull transfers
- `authorization`: the newly generated access token.

<details>
  <summary>DataAddress with access token</summary>

  ```json
  {
    "dspace:dataAddress": {
      "@type": "dspace:DataAddress",
      "dspace:endpointType": "https://w3id.org/idsa/v4.1/HTTP",
      "dspace:endpoint": "http://example.com",
      "dspace:endpointProperties": [
        {
          "@type": "dspace:EndpointProperty",
          "dspace:name": "https://w3id.org/edc/v0.0.1/ns/authorization",
          "dspace:value": "token"
        },
        {
          "@type": "dspace:EndpointProperty",
          "dspace:name": "https://w3id.org/edc/v0.0.1/ns/authType",
          "dspace:value": "bearer"
        }
      ]
    }
  }
  ```
</details><br/>

This `DataAddress` is returned in the `DataFlowResponse` as mentioned [here](#21-start). With that alone, the data plane
would not be able to determine token revocation or invalidation, so it must also _record_ the access token.

To that end, the EDC data plane stores an `AccessTokenData` object that contains the token, the source `DataAddress` and
some information about the bearer of the token, specifically:

- agreement ID
- asset ID
- transfer process ID
- flow type (`push` or `pull`)
- participant ID (of the consumer)
- transfer type (see [later sections](#4-data-plane-registration) for details)

The token creation flow is illustrated by the following sequence diagram:

![](./data-plane-signaling_create-token.png)

#### 3.2.4 Access Token Validation and Revocation

When the consumer executes a REST request against the provider data plane's public API, it must send the previously
received access token (inside the `DataAddress`) in the `Authorization` header.

The data plane then attempts to resolve the `AccessTokenData` object associated with that token and checks that the
token is valid.

The authorization flow is illustrated by the following sequence diagram:

![](data-plane-signaling_authorize.png)

A default implementation will be provided that always returns `true`. Extensions can supply alternative implementations
that perform use-case-specific authorization checks.

> Please note that `DataPlaneAccessControlService` implementation must handle all request types (including transport
> types) in a data plane runtime. If multiple access check implementations are required, creating a multiplexer or
> individual data plane runtimes is recommended.

> Note that in EDC, the access control check (step 8) always returns `true`!

In order to _revoke_ the token with immediate effect, it is enough to delete the `AccessTokenData` object from the
database. This is done using the `DataPlaneAuthorizationService` as well.

### 3.3 Token expiry and renewal

EDC does **not currently implement** token expiry and renewal, so this section is intended for developers who wish to
provide a custom data plane.

To implement token renewal, the recommended way is to create an extension, that exposes a refresh endpoint which can be
used by consumers. The URL of this refresh endpoint could be encoded in the original `DataAddress` in the
`dspace:endpointProperties` field.
> In any case, this will be a dataspace-specific solution, so administrative steps are
required to achieve interoperability.

## 4. Data plane registration

The life cycle of a data plane is decoupled from the life cycle of a control plane. That means, they could be started,
paused/resumed and stopped at different points in time. In clustered deployments, this is very likely the default
situation. With this, it is also possible to add or remove individual data planes anytime.

When data planes come online, they _register_ with the control plane using the `DataPlaneSelectorControlApi`. Each
dataplane sends a `DataPlaneInstance` object that contains information about its supported transfer types, supported
source types, URL, the data plane's `component ID` and other properties.

From then on, the control plane sends periodic heart-beats to the dataplane.

## 5. Data plane selection

During data plane self-registration, the control plane builds a list of `DataPlaneInstance` objects, each of which
represents one (logical) data plane component. Note that these are _logical_ instances, that means, even replicated
runtimes would still only count as _one_ instance.

In a periodic task the control plane engages a state machine `DataPlaneSelectorManager` to manage the state of each
registered data plane. To do that, it simply sends a REST request to the `/v1/dataflows/check` endpoint of the data
plane. If that returns successfully, the dataplane is still up and running.
If not, the control plane will consider the data plane as "unavailable".

In addition to availability, the control plane also records the _capabilities_ of each data plane, i.e. which which
source data types and transfer types are supported. Each data plane must declare where it can transfer data _from_
(source type, e.g. `AmazonS3`) and _how_ it can transfer data (transfer type, e.g. `Http-PULL`).


### 5.1 Building the catalog

The data plane selection directly influences the contents of the catalog: for example, let say that a particular
provider can transmit an asset either via HTTP (pull), or via S3 (push), then each one of these variants would be
represented in the catalog as individual `Distribution`.

Upon building the catalog, the control plane checks for each `Asset`, whether the `Asset.dataAddress.type` field is
contained in the list of `allowedTransferTypes` of each `DataPlaneInstance`

In the example above, at least one data plane has to have `Http-PULL` in its `allowedTransferTypes`, and at least one
has to have `AmazonS3-PUSH`. Note that one data plane could have _both_ entries.

### 5.2 Fulfilling data requests

When a `START` message is sent from the control plane to the data plane via the Signaling API, the data plane first
checks whether it can fulfill the request. If multiple data planes can fulfill the request, the `selectionStrategy` is
employed to determine the actual data plane.

This check is necessary, because a `START` message could contain a transfer type, that is not supported by any of the
data planes, or all data planes, that could fulfill the request are unavailable.

This algorithm is called _data plane selection_.

> Selection strategies can be added via extensions, using the `SelectionStrategyRegistry`. By default, a data plane is
> selected at random.
