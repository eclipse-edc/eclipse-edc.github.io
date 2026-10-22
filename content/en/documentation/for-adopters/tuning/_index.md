---
title: Tuning
description: How to configure the EDC Runtime to reach out better performances
weight: 80
---

<!-- TOC -->
  * [State Machines](#state-machines)
    * [Settings](#settings)
    * [How to tune them](#how-to-tune-them)
    * [State machine nuances](#state-machine-nuances)
    * [Lease duration](#lease-duration)
    * [Task-based state machine (NATS)](#task-based-state-machine-nats)
    * [Known limitations](#known-limitations)
<!-- TOC -->

Out of the box the EDC provides a set of default configurations that aim to find a good balance for performances.
The extensibility nature of the EDC permits the user to configure it deeply.

We will explain how these settings can be fine-tuned.

## State Machines
At the core of the EDC there is the [`State Machine`](../../for-contributors/runtime/programming-primitives.md#1-state-machines) 
concept. In the most basic runtimes as Connector or IdentityHub there are some of them, and they can be configured 
properly.

### Settings
The most important settings for configuring a state machine are:
- `state-machine.iteration-wait`
  - the time that the state machine will pass before fetching the next batch of entities to process in the case in the
    last iteration there was no processing; Otherwise no wait is applied.
- `state-machine.batch-size`
  - how many entities are fetched from the store for processing by the connector instance. The entities are locked
    pessimistically against mutual access, so for the time of the processing no other connector instances can read
    the same entities.
- `send.retry.limit`
  - how many times a failing process execution can be tried before failure.
- `send.retry.base-delay.ms`
  - how many milliseconds have to pass before the first retry after a failure. Next retries are calculated with an
    exponential function (e.g. if the first delay is 10ms)

### How to tune them

By default, on every iteration 20 entities (`state-machine.batch-size`) are fetched and leased by the runtime to be processed.
If no entity is processed in a whole iteration by default the state machine will wait for 1000 milliseconds (`state-machine.batch-size`)
until the next iteration.
If at least one entity is processed in an iteration, there's no wait time before the next iteration.

So, for example reducing the `state-machine.batch-size` will mean that the state
machine will be more reactive, and increasing the `state-machine.batch-size` will mean that more entities will be processed
in the same iteration. Please note that increasing `batch-size` too much could bring to longer iteration time and that 
reducing `iteration-wait` too much will make the iterations will be less efficient, as the fetch and lease (see, database interaction)
operation will happen more often.

If tweaking the settings doesn't give you a performance boost, you can achieve them through horizontal scaling.

### State machine nuances

How to tune them depends on the nature of the state machine, but let's list the most important state machines and explain
what they do, this will help out in tune them appropriately.

The setting need to be constructed this way:
`edc.<state machine name>.<setting>`.
So, for example, `edc.negotiation.provider.state-machine.batch-size` configures the batch size for the negotiation provider
state machine.

#### Control-plane

- `negotiation.consumer`: handles the contract negotiations from a consumer perspective
- `negotiation.provider`: handles the contract negotiations from a provider perspective
- `transfer`: handles the transfer processes

these state machines manages interactions with the counter-parties in the negotiation and transfer protocols. It's good
practice to have them reactive to permit quick handshakes.

_tuning suggestion:_ \
`state-machine.iteration-wait`: in the order of 100/1000 milliseconds \
`state-machine.batch-size` in the order of 10/100 \

- `policy.monitor`: evaluates policies for ongoing transfers

this state machine ensures that the policies of ongoing transfers are still valid. It's not necessary to have it run in
the order of milliseconds, given that in real world policies can last different days or months, so having some seconds but
also minutes as delay in evaluating them shouldn't be an issue (if it is in your use case, please tune accordingly!)

 _tuning suggestion:_ \
`state-machine.iteration-wait`: in the order of 30/60 minutes (translated in ms) \
`state-machine.batch-size` in the order of 10/100 \

- `data.plane.selector`: checks registered data planes availability

this state machine checks registered data planes and verifies if they are available or not. If the data-planes in your
environment are not supposed to change often the wait time can be keep high to avoid unnecessary database interaction:

_tuning suggestion:_ \
`state-machine.iteration-wait`: in the order of 1/10 minutes (translated in ms) \
`state-machine.batch-size` in the order of 10/100 \

#### Data-plane

- `dataplane`: handles the data flows
this state machine manages the data-flows so based on how many data flows are executed it can be tuned accordingly.
  
_tuning suggestion:_ \
`state-machine.iteration-wait`: in the order of 100/1000 milliseconds for many PUSH transfers, consider 1/10 seconds for few PULL transfers. \
`state-machine.batch-size` in the order of 10/100 \

### Lease duration

When several connector replicas share the same database, an entity is leased by the replica that processes it. If the
processing lasts longer than the lease, the lease expires and the entity is processed again, by another replica or by
the same one. The lease must then last longer than the slowest processing step, including the HTTP timeouts and the
retries of a protocol message.

| Setting                                        | Default |
|------------------------------------------------|---------|
| `edc.transfer.state-machine.lease-duration`    | `PT60S` |
| `edc.negotiation.state-machine.lease-duration` | `PT60S` |
| `edc.policy.monitor.lease-duration`            | `PT60S` |

### Task-based state machine (NATS)

Instead of polling the store, the transfer processes and the contract negotiations can be driven by tasks published to
NATS JetStream for every state change. The settings above about iterations and batches don't apply to it; the
following ones do:

- **Workers:** a subscriber handles the messages it fetches with `edc.nats.tp.subscriber.workers` /
  `edc.nats.cn.subscriber.workers` workers (default 1), i.e. the number of messages handled concurrently. With a single
  worker, a slow counter-party delays all the tasks behind it on that replica.
- **Prefetch:** a subscriber holds at most `workers + prefetch` messages, with `edc.nats.tp.subscriber.prefetch` /
  `edc.nats.cn.subscriber.prefetch` (default 10), and fetches again once half of them are completed, up to
  `edc.nats.tp.subscriber.batch-size` / `edc.nats.cn.subscriber.batch-size` messages per fetch (default 100). The
  messages held by a replica can't be taken by another one, so keep the prefetch small.
- **Database connections:** a worker holds a database connection while it makes the remote call of a task. Size the
  datasource pool for the workers of both subscribers (transfer processes and contract negotiations), on top of the
  API traffic.
- **Retries:** a retryable failure is delivered again after `edc.transfer.send.retry.base-delay.ms` /
  `edc.negotiation.send.retry.base-delay.ms` (default 1000), doubled at every delivery, up to
  `edc.transfer.send.retry.limit` / `edc.negotiation.send.retry.limit` (default 7), as on the poll-based state
  machine. There is no maximum delay: a high limit leads to very long delays.
- **Streams and consumers:** the ones created by the subscribers (`edc.nats.tp.subscriber.autocreate`,
  `edc.nats.cn.subscriber.autocreate`) are meant for testing: memory storage, limits retention and the server
  defaults. In production, provision them with persistent storage and the following settings:
  - `MaxAckPending`: size it for the tasks that can wait at the same time. A task waiting for a retry delay counts
    toward it, and the limit is shared by all the replicas, which use the same durable consumer. When it is reached,
    new tasks are not delivered until some delays expire. It must also cover the `workers + prefetch` messages held by
    every replica.
  - Ack wait: the subscriber marks the messages it holds as in progress at a third of the ack wait, so the ack wait
    does not need to cover the processing time.
- **Task store:** the default in-memory task store does not work with several replicas: use the SQL task store
  (`task-store-sql`).

### Known limitations

The accepted limitations of both state machines, their impact and how to mitigate them are listed in
[State Machines Known Limitations](../control-plane/state-machines/_index.md).
