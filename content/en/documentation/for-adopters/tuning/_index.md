---
title: Tuning
description: How to configure the EDC Runtime to reach out better performances
weight: 80
---

<!-- TOC -->
  * [State Machines](#state-machines)
    * [Settings](#settings)
    * [How to tune them](#how-to-tune-them)
<!-- TOC -->

Out of the box the EDC provides a set of default configurations that aim to find a good balance for performances.
The extensibility nature of the EDC permits the user to configure it deeply.

We will explain how these settings can be fine tuned

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
  - how many time a failing process execution can be tried before failure.
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
