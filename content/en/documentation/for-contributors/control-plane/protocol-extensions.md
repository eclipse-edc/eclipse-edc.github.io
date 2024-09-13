---
title: Protocol Extensions
weight: 10
---


<!-- TOC -->
* [Protocol Extensions](#protocol-extensions)
  * [1. RemoteMessage](#1-remotemessage)
    * [1.1 Delivering messages with RemoteMessageDispatcher](#11-delivering-messages-with-remotemessagedispatcher)
    * [1.2 Handling incoming messages with protocol services](#12-handling-incoming-messages-with-protocol-services)
  * [2. DSP protocol implementation](#2-dsp-protocol-implementation)
    * [2.1 `RemoteMessage` handlers](#21-remotemessage-handlers)
    * [2.2 HTTP endpoints](#22-http-endpoints)
    * [2.2 `RemoteMessage` transformers](#22-remotemessage-transformers)
<!-- TOC -->


The EDC officially supports the [Dataspace protocol](#2-dsp-protocol) using the HTTPs bindings, but since it is an extensible platform, multiple protocol implementations can be supported for inter-connectors communication. Each supported protocols is identified by a unique key used by EDC for dispatching a [remote message](#1-remotemessage).

## 1. RemoteMessage

At the heart of EDC message exchange mechanism lies the `RemoteMessage` interface, which describes the `protocol`, the `counterPartyAddress` and the `counterPartyId` used for a message delivery.

`RemoteMessage` extensions can be divided in three groups:

- [Catalog](./entities.md#6-catalog) (`catalog-spi`)
- [Contract negotiation](./entities.md#4-contract-negotiations) (`contract-spi`)
- [Transfer process](./entities.md#7-transfer-processes) (`transfer-spi`)

Each `RemoteMessage` is:

- Delivered to the counter-party using a [RemoteMessageDispatcher](#11-delivering-messages-with-remotemessagedispatcher).
- Received by the counter-party through the protocol implementation (e.g HTTP) and handled by the [protocol services](#11-handling-ingress-messages-with-protocol-services) layer.


### 1.1 Delivering messages with RemoteMessageDispatcher

Each protocol implements a `RemoteMessageDispatcher`:

```java
public interface RemoteMessageDispatcher {

    String protocol();

    <T, M extends RemoteMessage> CompletableFuture<StatusResult<T>> dispatch(Class<T> responseType, M message);

}
```
and it is registered in the `RemoteMessageDispatcherRegistry`, where it gets associated to the protocol defined in `RemoteMessageDispatcher#protocol`.

Internally EDC uses the `RemoteMessageDispatcherRegistry` whenever it needs to deliver a `RemoteMessage` to the counter-party. The `RemoteMessage` then gets routed to the right `RemoteMessageDispatcher` based on the `RemoteMessage#getProtocol` property.


> EDC also uses `RemoteMessageDispatcherRegistry` for non-protocol messages  when dispatching [event callbacks](./service-layers.md#63-registering-for-callbacks-webhooks)

### 1.2 Handling incoming messages with protocol services

On the ingress side, protocol implementations should be able to receive messages through the network (e.g. [API Controllers](./service-layers.md#1-api-controllers)), deserialize them into the corresponding `RemoteMessage`s and then dispatching them to the right protocol service.

Protocol services are three:

- `CatalogProtocolService`
- `ContractNegotiationProtocolService`
- `TransferProcessProtocolService`

which handle respectively `Catalog`, `ContractNegotiation` and `TransferProcess` messages.

## 2. DSP protocol implementation

The [Dataspace protocol](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol) protocol implementation is available under the `data-protocol/dsp` subfolder in the [Connector](https://github.com/eclipse-edc/Connector) repository and it is identified by the key `dataspace-protocol-http`.

It extends the `RemoteMessageDispatcher` with the interface `DspHttpRemoteMessageDispatcher` (`dsp-spi`), which adds an additional method for registering message [handlers](#21-remotemessage-handlers).

The implementation of the three [DSP](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol) specifications:

- [Catalog](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol/catalog/catalog.protocol)
- [Contract Negotiation](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol/contract-negotiation/contract.negotiation.protocol)
- [Transfer Process](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol/transfer-process/transfer.process.protocol)

is separated in multiple extension modules grouped by specification.

> This allows for example to build a runtime that only serves a dsp catalog requests useful the *Management Domains* scenario.

Each specification implementation defines [handlers](#21-remotemessage-handlers), [transformers](#22-remotemessage-transformers) for `RemoteMessage`s and exposes [HTTP endpoints](#22-http-endpoints).

> The `dsp` implementation also provide [HTTP endpoints](#22-http-endpoints) for the DSP [common functionalities](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol/common-functionalities/common.protocol).

### 2.1 `RemoteMessage` handlers

Handlers map a `RemoteMessage` to an HTTP Request and instruct the `DspHttpRemoteMessageDispatcher` how to extract the response body to a desired type.


### 2.2 HTTP endpoints

Each `dsp-*-http-api` module exposes its own [API Controllers](./service-layers.md#1-api-controllers) for serving the specification requests. Each request handler transforms the JSON-LD in input, if present, into a `RemoteMessage` and then calls the [protocol service](#12-handling-incoming-messages-with-protocol-services) layer.

### 2.2 `RemoteMessage` transformers

Each `dsp-*-transform` module registers in the DSP API context [`Transformers`](./programming-primitives.md#2-transformers) for mapping JSON-LD objects from and to `RemoteMessage`s.
