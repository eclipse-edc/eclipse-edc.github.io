---
title: Observability
description: How to react to state changes and events in an EDC runtime, and how to monitor it with health checks, logs, traces and metrics
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
  * [4. Participant callbacks](#4-participant-callbacks)
  * [5. Publishing events to NATS](#5-publishing-events-to-nats)
  * [Choosing the right approach](#choosing-the-right-approach)
  * [Health checks](#health-checks)
  * [Version information](#version-information)
  * [Logging](#logging)
  * [Tracing](#tracing)
  * [Metrics](#metrics)
<!-- TOC -->

## Overview

EDC processes are asynchronous. State changes — such as a contract negotiation reaching agreement or a transfer process
starting — are communicated through an internal eventing system. There are five ways to observe these state changes
from outside the runtime or from within a custom extension:

| Approach | Where the consumer runs | How it is registered |
|---|---|---|
| In-process event subscriber | Same JVM as the EDC runtime | Custom extension, injected `EventRouter` |
| Per-request webhooks | External HTTP endpoint | `callbackAddresses` in Management API request bodies |
| Static callbacks | External HTTP endpoint | `edc.callback.*` configuration properties |
| Participant callbacks | External HTTP endpoint | `edc.callbacks` participant context configuration entry |
| NATS event publishing | NATS subscribers | `events-nats` extension and `edc.events.nats.*` configuration properties |

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
[Service Layers documentation](../../for-contributors/runtime/service-layers.md#6-events-and-callbacks).

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

Static callbacks belong to the runtime, so their secrets are always resolved from the **default vault partition**,
even for events of a specific participant context. Per-request webhooks and
[participant callbacks](#4-participant-callbacks) resolve their secrets from the vault partition of the participant
context that owns the event instead.

### 3.3 Transactional callbacks

Setting `transactional=true` causes the callback to be dispatched synchronously, within the transaction that triggered
the event. A failure (e.g. the endpoint is unreachable) will propagate back as a processing error and may cause the
state machine to retry the transition. Use this only when the callback endpoint is highly reliable and you need
guaranteed delivery. For most monitoring use cases, leave `transactional=false`.

## 4. Participant callbacks

Participant callbacks are configured per participant context, and apply to all the matching events of that
participant context. They are useful when the events are not triggered by a Management API request of the
participant, so no per-request webhook can be attached: for example, a provider negotiation created by a contract
request of a counterparty, which can be [held for manual approval](../control-plane/policy-engine/negotiation-approval/_index.md).

The callbacks are read from the `edc.callbacks` entry of the participant context configuration. Its value is a JSON
array of callback addresses, with the same fields as the per-request webhooks:

```json
[
  {
    "uri": "https://approvals.example.com/hook",
    "events": [
      "contract.negotiation.held",
      "contract.negotiation.approved",
      "contract.negotiation.rejected"
    ],
    "transactional": false,
    "authKey": "Authorization",
    "authCodeId": "approvals-api-key"
  }
]
```

| Field | Description | Required | Default |
|---|---|---|---|
| `uri` | The HTTP endpoint to call | yes | — |
| `events` | Event type prefixes to subscribe to | yes | — |
| `transactional` | Whether to invoke the callback within the processing transaction (see [Transactional callbacks](#33-transactional-callbacks)) | no | `false` |
| `authKey` | The HTTP header name to use for authentication | no | — |
| `authCodeId` | Alias of the secret to send in the authentication header, resolved from the participant context's vault partition | no | — |

In the virtual runtime, the entry is set through the participant context configuration Management API. In the
classic runtime, the participant context configuration is the runtime configuration, so `edc.callbacks` is set as a
regular setting.

Changes to the configuration apply immediately, as the callbacks are not stored on the processes. An invalid
`edc.callbacks` value is logged as a warning and ignored, so it never affects event processing.

## 5. Publishing events to NATS

The `events-nats` extension publishes every event of the runtime to a [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream)
stream, from which any number of applications can consume them. It is not part of the BOMs: add the module
`org.eclipse.edc:events-nats` to the runtime.

| Setting | Default | Description |
|---|---|---|
| `edc.events.nats.url` | (required) | URL of the NATS server |
| `edc.events.nats.stream` | (required) | name of the stream |
| `edc.events.nats.stream.create` | `true` | creates the stream at startup; startup fails if it already exists |
| `edc.events.nats.stream.create.force` | `false` | deletes and recreates an existing stream |

The stream created by the runtime uses memory storage and interest retention, for testing; in production, create the
stream yourself, on the subjects `events.>`, and set `edc.events.nats.stream.create=false`.

Each event is published asynchronously, on the subject `events.<event name>`, e.g.
`events.contract.negotiation.finalized` or `events.transfer.process.started`, as a
[CloudEvent](https://cloudevents.io/) (`Content-Type: application/cloudevents+json`) whose `type` is the event class and
`data` the event payload. The message headers carry the trace context of the event (see [Tracing](#tracing)).
Publishing errors are logged, not retried: use callbacks when every event must be delivered.

To authenticate with an NKey, add the module `nats-auth-nkey` and set `edc.nats.auth.nkey.seed.path` to the file holding
the seed; the same credentials are used for all the NATS connections of the runtime.

## Choosing the right approach

- Use **in-process event subscribers** when you are already writing a custom EDC extension and need the lowest latency
  or transactional semantics.
- Use **per-request webhooks** when you want to track specific operations triggered from a controller or orchestration
  layer that already constructs the Management API calls.
- Use **participant callbacks** when each participant context needs its own sink for a class of events, including
  processes that are not started through the Management API, such as provider contract negotiations.
- Use **static callbacks** when you want a centralized, always-on sink for a class of events without modifying
  individual API requests or shipping code to the runtime.
- Use **NATS event publishing** when several applications consume the events of the runtime, or when they need to
  replay them, and occasional losses are acceptable.

## Health checks

The `api-observability` extension (part of the base BOMs) serves health checks on the default API context
(`web.http.port`, default `8181`, and `web.http.path`, default `/api`):

| Endpoint | Use |
|---|---|
| `GET /api/check/startup` | startup probe: the runtime has booted |
| `GET /api/check/liveness` | liveness probe |
| `GET /api/check/readiness` | readiness probe |
| `GET /api/check/health` | same as the startup check |

They answer `200` when every check is successful and `503` otherwise, with the result of each check:

```json
{
  "componentResults": [
    { "component": "BaseRuntime", "isHealthy": true, "failure": null }
  ],
  "isSystemHealthy": true
}
```

The checks contributed by EDC are: the boot of the runtime (startup), the poll-based state machines and the NATS task
subscribers (liveness: they report a failure when they stopped running), and the HashiCorp Vault connection. The
database is not checked. Extensions can contribute their own checks through the `HealthCheckService`.

In Kubernetes, use them as probes:

```yaml
startupProbe:
  httpGet:
    path: /api/check/startup
    port: 8181
livenessProbe:
  httpGet:
    path: /api/check/liveness
    port: 8181
readinessProbe:
  httpGet:
    path: /api/check/readiness
    port: 8181
```

## Version information

`GET /api/v1/version`, on the default API context, lists the APIs the runtime serves and their versions:

```json
{
  "management": [
    { "version": "4.3.0", "urlPath": "/v4", "lastUpdated": "2026-10-29T18:00:47Z", "maturity": "stable" },
    { "version": "5.2.0", "urlPath": "/v5", "lastUpdated": "2026-10-29T18:00:47Z", "maturity": "stable" }
  ]
}
```

## Logging

By default, the runtime logs to the standard output, one line per message, with its name, the level and the time:

```
[controlplane] INFO 2026-11-04T10:15:30.123 Runtime 2a6c... ready
```

The level is set with the program argument `--log-level` (`SEVERE`, `WARNING`, `INFO`, the default, or `DEBUG`), e.g.
`java -jar controlplane.jar --log-level=DEBUG`; `--no-color` disables the colors. Errors (`SEVERE`) are always logged.

Logs can be sent to an OpenTelemetry collector instead, with the `otel-monitor` extension (not part of the BOMs) and the
OpenTelemetry Java agent: each log message becomes an OpenTelemetry log record of the logger `org.eclipse.edc`, with the
exception, if any, as attributes. Other log formats are provided by extensions implementing `MonitorExtension`.

## Tracing

EDC is instrumented for [OpenTelemetry](https://opentelemetry.io/) tracing, which is enabled by running the runtime
with the [OpenTelemetry Java agent](https://opentelemetry.io/docs/zero-code/java/agent/) and configured with the agent's
settings, e.g.:

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=controlplane \
     -Dotel.exporter.otlp.endpoint=http://otel-collector:4318 \
     -jar controlplane.jar
```

The agent traces the incoming and outgoing HTTP requests (Jetty, Jersey, OkHttp) and the database calls, and EDC adds
spans for the incoming DSP messages, the processing of the contract negotiation and transfer process states, and the
negotiations started through the Management API. The trace context of a negotiation or transfer is stored with it, so
that its later steps belong to the same trace, with both the poll-based and the task-based state machines. Events
published to NATS carry the trace context of the step that emitted them.

Tracing has a cost: in load tests, the agent with full instrumentation reduced the throughput of the control plane
noticeably. Sample traces (`otel.traces.sampler`) in production.

## Metrics

The Micrometer extensions `micrometer-core`, `jetty-micrometer` and `jersey-micrometer` (not part of the BOMs) collect
JVM, HTTP client, executor, Jetty and Jersey metrics, see
[Instrumentation with Micrometer](../../for-contributors/metrics.md). EDC doesn't expose them itself: export them with the
OpenTelemetry Java agent, e.g. with `-Dotel.instrumentation.micrometer.enabled=true` and
`-Dotel.metrics.exporter=prometheus`, which serves them for Prometheus on port `9464`.
