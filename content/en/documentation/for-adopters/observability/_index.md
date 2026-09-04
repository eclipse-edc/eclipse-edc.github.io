---
title: Observability
description: How to react to state changes and events in an EDC runtime
weight: 85
---

<!-- TOC -->
  * [Overview](#overview)
  * [1. In-process event subscribers](#1-in-process-event-subscribers)
    * [1.1 Async vs. sync dispatch](#11-async-vs-sync-dispatch)
    * [1.2 Example: auditing extension](#12-example-auditing-extension)
  * [2. Webhooks (per-request callbacks)](#2-webhooks-per-request-callbacks)
  * [3. Static callbacks](#3-static-callbacks)
    * [3.1 Configuration reference](#31-configuration-reference)
    * [3.2 Authentication](#32-authentication)
    * [3.3 Transactional callbacks](#33-transactional-callbacks)
  * [Choosing the right approach](#choosing-the-right-approach)
<!-- TOC -->

## Overview

EDC processes are asynchronous. State changes — such as a contract negotiation reaching agreement or a transfer process
starting — are communicated through an internal eventing system. There are three ways to observe these state changes
from outside the runtime or from within a custom extension:

| Approach | Where the consumer runs | How it is registered |
|---|---|---|
| In-process event subscriber | Same JVM as the EDC runtime | Custom extension, injected `EventRouter` |
| Per-request webhooks | External HTTP endpoint | `callbackAddresses` in Management API request bodies |
| Static callbacks | External HTTP endpoint | `edc.callback.*` configuration properties |

## 1. In-process event subscribers

This approach is for custom EDC extensions that need to react to events inside the same runtime process. It requires
writing a Java extension that is bundled into your EDC distribution.

The entry point is the `EventRouter` service. Register an `EventSubscriber` against an event type during extension
initialization:

```java
@Inject
private EventRouter eventRouter;

@Override
public void initialize(ServiceExtensionContext context) {
    eventRouter.register(TransferProcessEvent.class, new MyTransferEventHandler());
}
```

Subscribers are typed over a class hierarchy. Registering against `TransferProcessEvent` (a base class) will receive
all transfer-process-related events. Registering against a concrete class such as `TransferProcessStarted` will only
receive that specific event.

### 1.1 Async vs. sync dispatch

`EventRouter` offers two dispatch modes:

- **`register` (async)**: The subscriber is invoked on a separate thread. The main processing thread is not blocked.
  Use this for notifications and fire-and-forget scenarios.
- **`registerSync` (sync)**: The subscriber is invoked on the same thread that published the event. A failure or
  exception in the subscriber propagates to the caller and can roll back a transaction. Use this when you need
  reliable, at-least-once delivery (e.g. persisting events to an audit log).

### 1.2 Example: auditing extension

```java
public class AuditingExtension implements ServiceExtension {

    @Inject
    private EventRouter eventRouter;

    @Override
    public void initialize(ServiceExtensionContext context) {
        // sync so that audit entries are written within the same transaction
        eventRouter.registerSync(TransferProcessEvent.class, new AuditingEventHandler());
    }
}

public class AuditingEventHandler implements EventSubscriber {

    @Override
    public <E extends Event> void on(EventEnvelope<E> envelope) {
        if (envelope.getPayload() instanceof TransferProcessEvent event) {
            // write event to audit store
        }
    }
}
```

For a full explanation of the eventing model, including how to emit custom events, see the
[Service Layers documentation](/documentation/for-contributors/runtime/service-layers/#6-events-and-callbacks).

## 2. Webhooks (per-request callbacks)

When you cannot bundle a custom extension into the runtime, you can supply an HTTP callback URL directly in the
Management API request that initiates a process. EDC will POST the event payload to that URL when the corresponding
state change occurs.

Callback addresses are provided in the `callbackAddresses` array of the request body. For example, when initiating a
contract negotiation:

```json
// POST /v4/contractnegotiations
{
  "@context": ["https://w3id.org/edc/connector/management/v2"],
  "@type": "ContractRequest",
  "counterPartyAddress": "http://provider-address",
  "protocol": "dataspace-protocol-http",
  "policy": { "...": "..." },
  "callbackAddresses": [
    {
      "uri": "https://my-backend/edc-events",
      "events": ["contract.negotiation", "transfer.process"],
      "transactional": false,
      "authKey": "Authorization",
      "authCodeId": "my-secret-vault-alias"
    }
  ]
}
```

The `events` field accepts dot-separated event type prefixes. A value of `"contract.negotiation"` matches all
contract-negotiation events; a value of `"transfer.process.started"` matches only the started event.

This approach is tightly scoped: the webhook is only active for the process initiated by that specific request.

## 3. Static callbacks

Static callbacks are configured at runtime startup and apply globally to all matching events, regardless of which
Management API request triggered the process. This is useful when you want a single backend endpoint to receive all
events of a given type without modifying individual API calls.

Static callbacks require the `callback-static-endpoint` extension to be present in your distribution.

Each callback is defined under the `edc.callback.<name>` configuration prefix, where `<name>` is an arbitrary
identifier that groups the settings for one endpoint. Multiple callbacks can be configured by using different names.

```properties
# Register a callback named "audit" that receives all transfer-process events
edc.callback.audit.uri=https://my-backend/edc-events
edc.callback.audit.events=transfer.process

# Register a second callback named "monitor" for all contract-negotiation events
edc.callback.monitor.uri=https://monitoring.internal/hooks
edc.callback.monitor.events=contract.negotiation
```

### 3.1 Configuration reference

| Property | Description | Required | Default |
|---|---|---|---|
| `edc.callback.<name>.uri` | The HTTP endpoint to call | yes | — |
| `edc.callback.<name>.events` | Comma-separated list of event type prefixes. Leave empty to receive all events. | no | (all events) |
| `edc.callback.<name>.transactional` | Whether to invoke the callback synchronously within the processing transaction (see [below](#33-transactional-callbacks)) | no | `false` |
| `edc.callback.<name>.auth.key` | The HTTP header name to use for authentication | no | — |
| `edc.callback.<name>.auth.codeid` | Vault alias of the secret token to send in the authentication header | no | — |

### 3.2 Authentication

If the target endpoint requires authentication, provide the header name in `auth.key` and store the secret in EDC's
vault. The `auth.codeid` property is then set to the vault alias under which the secret is stored.

```properties
edc.callback.audit.uri=https://my-backend/edc-events
edc.callback.audit.events=transfer.process
edc.callback.audit.auth.key=Authorization
edc.callback.audit.auth.codeid=my-api-key-alias
```

> `auth.codeid` is required when `auth.key` is set. Providing `auth.key` without `auth.codeid` will cause the runtime
> to fail at startup.

### 3.3 Transactional callbacks

Setting `transactional=true` causes the callback to be dispatched synchronously, within the transaction that triggered
the event. A failure (e.g. the endpoint is unreachable) will propagate back as a processing error and may cause the
state machine to retry the transition. Use this only when the callback endpoint is highly reliable and you need
guaranteed delivery. For most monitoring use cases, leave `transactional=false`.

## Choosing the right approach

- Use **in-process event subscribers** when you are already writing a custom EDC extension and need the lowest latency
  or transactional semantics.
- Use **per-request webhooks** when you want to track specific operations triggered from a controller or orchestration
  layer that already constructs the Management API calls.
- Use **static callbacks** when you want a centralized, always-on sink for a class of events without modifying
  individual API requests or shipping code to the runtime.
