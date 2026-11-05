---
title: Task-based State Machines
description: Drive contract negotiations and transfer processes with tasks dispatched through NATS JetStream instead of polling the database.
weight: 28
---

<!-- TOC -->
  * [Overview](#overview)
  * [How it works](#how-it-works)
  * [Assembling the runtime](#assembling-the-runtime)
  * [Setting up NATS](#setting-up-nats)
    * [Streams and consumers](#streams-and-consumers)
    * [Authentication](#authentication)
  * [Configuration reference](#configuration-reference)
  * [Monitoring](#monitoring)
  * [Related](#related)
<!-- TOC -->

## Overview

The control plane advances contract negotiations and transfer processes with state machines. EDC has two
implementations:

- the **poll-based** state machines periodically query the database for the entities to process (see
  [Programming Primitives](../../../for-contributors/runtime/programming-primitives.md#1-state-machines));
- the **task-based** state machines react to every state change with a _task_, dispatched through
  [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream) to the replicas of the control plane. There is no polling:
  a step is processed as soon as the previous one is done, and the load is spread over the replicas by NATS.

The task-based state machines are the default of the multi-participant control plane.

## How it works

1. When a negotiation or a transfer process reaches a state that requires an action, e.g. sending a contract request,
   the control plane stores a task in the task store and, in the same transaction, publishes it to NATS, on the subject
   `<prefix>.<consumer|provider>.<task name>`, e.g. `negotiations.consumer.negotiation.request.prepare`.
2. A subscriber of a control plane replica receives the task from a durable JetStream consumer shared by all replicas,
   loads the entity and performs the action, e.g. the DSP request, which may create the next task.
3. The task is acknowledged and removed once it is done. A retryable failure, e.g. an unreachable counter-party, is
   delivered again after a growing delay (`edc.negotiation.send.retry.*`, `edc.transfer.send.retry.*`), a fatal one
   terminates the negotiation or transfer process.

Because the task is published before the transaction commits, a subscriber may receive it before the task is visible in
the store: it is then delivered again, up to `max-retries` times. A task whose entity changed in the meantime is
skipped.

## Assembling the runtime

| BOM | Content |
|---|---|
| `controlplane-virtual-base-bom` | the task-based state machines and the in-memory task store |
| `controlplane-virtual-feature-nats-bom` | the NATS publishers and subscribers of the negotiation and transfer tasks, and NKey authentication |
| `controlplane-virtual-feature-sql-bom` | the SQL task store (`task-store-sql`, `edc.sql.store.tasks.datasource`) |

All three are needed in production: without the NATS BOM, tasks are stored but never executed, and negotiations and
transfer processes don't progress; the in-memory task store doesn't work with several replicas. The
`controlplane-virtual-poll-base-bom` uses the poll-based state machines instead, and needs no NATS.

## Setting up NATS

The control plane needs a NATS server with JetStream enabled. The publishers and subscribers of contract negotiations
(`cn`) and transfer processes (`tp`) are configured separately, and can use the same server:

```properties
edc.nats.cn.publisher.url=nats://nats:4222
edc.nats.cn.subscriber.url=nats://nats:4222
edc.nats.tp.publisher.url=nats://nats:4222
edc.nats.tp.subscriber.url=nats://nats:4222
```

### Streams and consumers

The tasks are stored in one JetStream stream per kind, read through one durable consumer per kind shared by all the
replicas:

| | Contract negotiations | Transfer processes |
|---|---|---|
| Stream | `cn-stream` | `tp-stream` |
| Subjects | `negotiations.>` | `transfers.>` |
| Durable consumer | `cn-subscriber` | `tp-subscriber` |

With `edc.nats.cn.subscriber.autocreate=true` and `edc.nats.tp.subscriber.autocreate=true` (or the specific
`…stream.autocreate` and `…consumer.autocreate`), the subscribers create missing streams and consumers at startup.
These are meant for testing: memory storage, and the defaults of the server for everything else. In production, create
them beforehand, e.g. with the [NATS CLI](https://github.com/nats-io/natscli) or the NATS operator, with:

- **file storage**, so that tasks survive a restart of NATS, and replicas in a NATS cluster;
- a **work queue** or limits retention: an acknowledged task is not needed anymore;
- a **pull consumer** with explicit acknowledgement, filtered on the stream's subjects, whose name is the
  `subscriber.name`;
- **`MaxAckPending`** sized for the tasks that can be in progress or waiting for a retry delay at the same time,
  across all replicas, and **ack wait** of at least a few seconds (the subscribers mark the messages they hold as in
  progress every third of the ack wait). See [Tuning](../../tuning/_index.md#task-based-state-machine-nats).

The subjects of the publishers (`subject-prefix`) must match the subjects of the streams and consumers.

### Authentication

With the module `nats-auth-nkey` (in the NATS BOM), all NATS connections of the runtime authenticate with the NKey whose
seed is in the file `edc.nats.auth.nkey.seed.path`. Without the setting, the connections are not authenticated.

## Configuration reference

The settings exist for contract negotiations (`edc.nats.cn.*`) and transfer processes (`edc.nats.tp.*`); defaults are
given for `cn` / `tp`.

| Setting | Default | Description |
|---|---|---|
| `edc.nats.{cn,tp}.publisher.url` | `nats://localhost:4222` | NATS server of the publisher |
| `edc.nats.{cn,tp}.publisher.subject-prefix` | `negotiations` / `transfers` | prefix of the task subjects |
| `edc.nats.{cn,tp}.subscriber.url` | `nats://localhost:4222` | NATS server of the subscriber |
| `edc.nats.{cn,tp}.subscriber.stream` | `cn-stream` / `tp-stream` | stream of the tasks |
| `edc.nats.{cn,tp}.subscriber.subject` | `negotiations.>` / `transfers.>` | subjects of the stream and filter of the consumer |
| `edc.nats.{cn,tp}.subscriber.name` | `cn-subscriber` / `tp-subscriber` | durable consumer |
| `edc.nats.{cn,tp}.subscriber.autocreate` | `false` | creates the stream and the consumer if missing |
| `edc.nats.{cn,tp}.subscriber.stream.autocreate`, `…consumer.autocreate` | `false` | creates only the stream, or only the consumer |
| `edc.nats.{cn,tp}.subscriber.workers` | `1` | tasks processed concurrently by a replica |
| `edc.nats.{cn,tp}.subscriber.prefetch` | `10` | tasks fetched in advance by a replica |
| `edc.nats.{cn,tp}.subscriber.batch-size` | `100` | maximum tasks per fetch |
| `edc.nats.{cn,tp}.subscriber.max-wait` | `100` | maximum wait of a fetch, in ms |
| `edc.nats.{cn,tp}.subscriber.max-retries` | `3` | deliveries of a task that is not visible in the store yet |
| `edc.nats.auth.nkey.seed.path` | | file holding the NKey seed |
| `edc.sql.store.tasks.datasource` | `default` | datasource of the SQL task store |

How to size workers, prefetch and the database pool is described in [Tuning](../../tuning/_index.md#task-based-state-machine-nats).

## Monitoring

Each subscriber contributes a liveness check, which fails when it stopped consuming (see
[Health checks](../../observability/_index.md#health-checks)). The tasks pending in NATS can be inspected with the NATS
tools, e.g. `nats consumer info tp-stream tp-subscriber`. Each task is processed within the trace context of its
negotiation or transfer process, so all its steps belong to the trace in which it was created.

## Related

- [State Machines Known Limitations](../state-machines/_index.md)
- [Tuning](../../tuning/_index.md#task-based-state-machine-nats)
- Decision record: [NATS subscriber worker pool](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-10-20-nats-subscriber-worker-pool)
