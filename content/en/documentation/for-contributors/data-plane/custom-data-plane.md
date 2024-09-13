---
title: Custom Data Plane
weight: 30
---

<!-- TOC -->
* [Writing a custom data plane](#writing-a-custom-data-plane)
  * [1. The Registration Phase](#1-the-registration-phase)
  * [2. Handling DPS messages ](#2-handling-dps-messages)
    * [2.1 `START`](#)
        * [2.1.1 `PUSH`](#211-push)
        * [2.1.2 `PULL`](#212-pull)
    * [2.2 `SUSPEND` and `TERMINATE`](#22-suspend-and-terminate)

<!-- TOC -->

When the data-plane is not embedded, EDC uses the Data Plane Signaling protocol ([DPS](./data-plane-signaling/data-plane-signaling.md)) for the communication between control plane and data plane. In this chapter we will see how to leverage on [DPS](./data-plane-signaling/data-plane-signaling.md) for writing a custom data plane from scratch.

For example purposes, this chapter contains JS snippets that use `express` as web framework.

>  Since it's only for educational purposes, the code is not intended to be complete, as proper error handling and JSON-LD processing are not implemented

Our simple data plane setup looks like this:

```javascript
const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method, req.hostname, req.path, new Date(Date.now()).toString());
    next();
})

app.listen(port, () => {
    console.log(`Data plane listening on port ${port}`)
})

```

It's a basic `express` application that listens on port `3000` and logs every request with a basic middleware.

## 1. The Registration Phase

First we need to register our custom data plane in the EDC control plane.

By using the internal `Dataplane Selector` API available under the `control` context of EDC, we could send a registration request:

```http request
POST https://controlplane-host:port/api/control/v1/dataplanes
Content-Type: application/json
{
    "@context": {
        "edc": "https://w3id.org/edc/v0.0.1/ns/"
    },
    "@type": "DataPlaneInstance",
    "@id": "custom_dataplane",
    "url": "http://custom-dataplane-host:3000/dataflows",
    "allowedSourceTypes": [
        "HttpData"
    ],
    "allowedTransferTypes": [
        "HttpData-PULL",
        "HttpData-PUSH"
    ]
}
```

> It's up to the implementors to decide when the data plane gets registered. This may be a manual operation as well as automated in a process routine.

The `@id` is the data plane's `component ID`, which identify a [logical](./data-plane-signaling/data-plane-signaling.md#5-data-plane-selection) data plane component.

The `url` is the location on which the data plane will be receiving protocol [messages](#2-handling-dps-messages).

The `allowedSourceTypes` is an array of source type supported, in this case only `HttpData`.

The `allowedTransferTypes` is an array of supported transfer types. When using the [DPS](./data-plane-signaling/data-plane-signaling.md) the transfer type is by convention a string with format `<label>-{PULL,PUSH}`, which carries the type of the flow `push` or `pull`. By default in EDC the `label` always corresponds to a source/sync type (e.g `HttpData`), but it can be customized for data plane implementation.

With this configuration we declare that our data plane is able to transfer data using HTTP protocol in `push` and `pull` mode.

The lifecycle of a data plane instance is managed by the `DataPlaneSelectorManager` component implemented as [state machine](../control-plane/programming-primitives.md#1-state-machines). A data plane instance is in the `REGISTERED` state when created/updated. Then for each data plane a periodic heartbeat is sent for checking if it is still running.

If the data plane response is successful, the state transits to `AVAILABLE`. As soon as the data plane does not respond or returns a non successful response, the state transits to `UNAVAILABLE`.

Let's implement a route method for `GET /dataflows/check` in our custom data plane:

```javascript
app.get('/dataflows/check', (req, res) => {
    res.send('{}')
})
```

> Only the response code matters, the response body is ignored on the EDC side.

Once the data plane is started and registered we should see this entries in the logs:

```
GET localhost /dataflows/check Fri Aug 30 2024 18:01:56 GMT+0200 (Central European Summer Time)
```

And the status of our the data plane is `AVAILABLE`.


## 2. Handling DPS messages

When a transfer process is ready to be started by the [Control Plane](../contributor-handbook.md#2-the-control-plane), the `DataPlaneSignalingFlowController` is engaged for handling the transfer request. The `DPS` flow controller uses the `DataPlaneSelectorService` for selecting the right data plane instance based on it's capabilities and once selected it sends a [DataFlowStartMessage](#21-start) that our custom data plane should be able to process.

> The `AVAILABLE` state is a prerequisite to candidate the data plane instance in the selection process.

The `ID` of the selected data plane is stored in the transfer process entity for delivering subsequent messages that may be necessary in the lifecycle of a transfer process. (e.g. [SUSPEND and TERMINATE](#22-suspend-and-terminate))

### 2.1 `START`

If our data plane fulfills the data plane selection criteria, it should be ready to handle `DataFlowStartMessage` at the endpoint `/dataflows`:

```javascript
app.post('/dataflows', async (req, res) => {
    let { flowType } = req.body;
    if (flowType === 'PUSH') {
        await handlePush(req,res);
    } else if (flowType === 'PULL') {
        await handlePull(req,res);
    } else {
        res.status(400);
        res.send(`Flow type ${flowType} not supported`)
    }
});
```

We split the handling of the transfer request in `handlePush` and `handlePull` functions that handle [PUSH](#211-push) and [PULL](#212-pull) flow types.

The format of the `sourceDataAddress` and `destinationDataAddress` is aligned with the [DSP](https://github.com/eclipse-edc/Connector/blob/main/docs/developer/data-plane-signaling/data-plane-signaling-token-handling.md#2-updates-to-thedataaddress-format) specification.

### 2.1.1 `PUSH`

Our custom data plane should be able to transfer data (`PUSH`) from an `HttpData` source (`sourceDataAddress`) to an `HttpData` sink (`destinationDataAddress`).

The `sourceDataAddress` is the `DataAddress` configured in the [`Asset`](../control-plane/entities.md#1-assets) and may look like this in our case:


```json
{
    "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
    },
    "@id": "asset-1",
    "@type": "Asset",
    "dataAddress": {
        "@type": "DataAddress",
        "type": "HttpData",
        "baseUrl": "https://jsonplaceholder.typicode.com/todos"
    }
}
```

The `destinationDataAddress` is derived from the `dataDestination` in the [`TransferRequest`](../control-plane/entities.md#7-transfer-processes) and may look look this:

```json
{
    "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
    },
    "counterPartyAddress": "{{PROVIDER_DSP}}/api/dsp",
    "connectorId": "{{PROVIDER_ID}}",
    "contractId": "{{CONTRACT_ID}}",
    "dataDestination": {
        "type": "HttpData",
        "baseUrl": "{{RECEIVER_URL}}"
    },
    "protocol": "dataspace-protocol-http",
    "transferType": "HttpData-PUSH"
}
```

The simplest `handlePush` function would need to fetch data from the source `baseUrl` and send the result to the sink `baseUrl`.

A naive implementation may look like this:

```javascript
async function handlePush(req, res) {
    res.send({
        "@context": {
            "edc": "https://w3id.org/edc/v0.0.1/ns/"
        },
        "@type": "DataFlowResponseMessage"
    });

    const { sourceDataAddress, destinationDataAddress } = req.body;

    const sourceUrl = getBaseUrl(sourceDataAddress);
    const destinationUrl = getBaseUrl(destinationDataAddress);

    const response = await fetch(sourceUrl);

    await fetch(destinationUrl, {
        "method": "POST",
        body : await response.text()
    });
}
```

First we acknowledge the [Control Plane](../contributor-handbook.md#2-the-control-plane) by sending a `DataFlowResponseMessage` as response.

Then we transfer the data from `sourceUrl` to `destinationUrl`.

> The `getBaseUrl` is an utility function that extracts the `baseUrl` from the `DataAddress`.

Implementors should keep track of `DataFlowStartMessage`s in some persistent storage system in order to fulfill subsequent `DPS` messages on the same transfer id ([e.g. SUSPEND and TERMINATE](#22-suspend-and-terminate)).

For example in the streaming case, implementors may track the opened streaming channels, which could be terminated on-demand or by the [policy monitor](../control-plane/policy-monitor.md).


### 2.1.2 `PULL`

When receiving a `DataFlowStartMessage` in a `PULL` scenario there is no direct transfer to be handled by the data plane. Based on the `sourceDataAddress` in the `DataFlowStartMessage` a custom data plane implementation should create another `DataAddress` containing all the information required for the data transfer:


```javascript
async function handlePull(req, res) {
    const { sourceDataAddress } = req.body;
    const { dataAddress } = await generateDataAddress(sourceDataAddress);

    const response = {
        "@context": {
            "edc": "https://w3id.org/edc/v0.0.1/ns/"
        },
        "@type": "DataFlowResponseMessage",
        "dataAddress": dataAddress
    };
    res.send(response);
}
```

We will not implement the `generateDataAddress` function, as it may vary depending on the use case. But at the high level a `generateDataAddress` should generate a `DataAddress` in DSP format that contains useful information for the consumer for fetching the data: `endpoint`, `endpointType` and custom extensible properties `endpointProperties`.

For example the default [EDC](./data-plane-signaling/data-plane-signaling.md#323-access-token-generation) genarates a `DataAddress` that contains also authorization information like the auth token to be used when request data using the Data Plane [public API](./data-plane-signaling/data-plane-signaling.md#3-data-plane-public-api) and the token type (e.g. bearer).

Implementors may also want to track `PULL` requests in a persistent storage, which can be useful in scenario like token revocation or transfer process termination.

How the actual data requests is handled depends on the implementation of the custom data plane. It could be done in the same way as it's done in the EDC data plane, which exposes an endpoint that validates the authorization and it proxies the request to the `sourceDataAddress`.

The [DPS](./data-plane-signaling/data-plane-signaling.md) gives enough flexibility for implementing different strategy for different use cases.

### 2.2 `SUSPEND` and `TERMINATE`

A [DPS](./data-plane-signaling/data-plane-signaling.md) compliant data plane implementation should also support [SUSPEND](./data-plane-signaling/data-plane-signaling.md#22-suspend) and [TERMINATE](./data-plane-signaling/data-plane-signaling.md#23-terminate) messages.

If implementors are keeping track of the transfers (`STARTED`), those message are useful for closing the data channels and cleaning-up I/O resources.
