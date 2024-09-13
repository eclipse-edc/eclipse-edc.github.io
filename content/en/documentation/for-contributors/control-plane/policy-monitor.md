---
title: Policy Monitor
weight: 10
---


Some transfer types, once accepted by the `provider`, never reach the `COMPLETED` state. Streaming and HTTP transfers in consumer pull scenario are examples of this. In those scenarios the transfer will remain active (`STARTED`) until it gets terminated either manually by using the transfer processes [management API](./entities.md#7-transfer-processes), or automatically by the policy monitor, if it has been configured in the EDC runtime.

The policy monitor (`PolicyMonitorManager`) is a component that watches over on-going transfers on the provider side and ensures that the associated policies are still valid. The default implementation of the policy monitor tracks the monitored transfer processes in it's own entity `PolicyMonitorEntry` stored in the `PolicyMonitorStore`.

Once a transfer process transition to the `STARTED` state on the provider side, the policy monitor gets notified through the [eventing system](./service-layers.md#6-events-and-callbacks) of EDC and start tracking transfer process. For each monitored transfer process in the `STARTED` state the policy monitor retrieves the policy associated (through [contract agreement](./entities.md#5-contract-agreements)) and runs the [Policy Engine](./entities.md#22-policy-scopes-and-bindings) using the `policy.monitor` as scope.
If the policy is no longer valid, the policy monitor marks the transfer process for termination (`TERMINATING`) and stops tracking it.

The data plane also gets notified through the [data plane signaling](../contributor-handbook.md#210-data-plane-signaling) protocol about the termination of the transfer process, and if accepted by the data plane, the data transfer terminates as well.

## Note for implementors

Implementors that want a [Policy function](./entities.md#23-policy-evaluation-functions) to be evaluated at the policy monitor layer need to bind such function to the `policy.monitor` scope.

Note that because the policy evaluation happens in the background, the `PolicyContext` does not contain `ParticipantAgent` as context data. This means that the Policy Monitor cannot evaluate policies that involve VerifiableCredentials.

Currently the only information published in the `PolicyContext` available for functions in the `policy.monitor` scope are the [`ContractAgreement`](./entities.md#5-contract-agreements), and the `Instant` at the time of the evaluation.

A bundled example of a [Policy function](./entities.md#23-policy-evaluation-functions) that runs in the `policy.monitor` scope is the `ContractExpiryCheckFunction` which checks if the [contract agreement](./entities.md#5-contract-agreements) is not expired.
