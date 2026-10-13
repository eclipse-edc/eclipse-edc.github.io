---
title: Contract Negotiation Approval
description: Hold provider contract negotiations for manual approval, driven by the contract policy.
weight: 30
---

<!-- TOC -->
  * [Overview](#overview)
  * [Enabling approval](#enabling-approval)
  * [Writing approval rules](#writing-approval-rules)
    * [The approval scope](#the-approval-scope)
    * [What approval rules can use](#what-approval-rules-can-use)
    * [Public rules: declaring manual approval in the offer](#public-rules-declaring-manual-approval-in-the-offer)
    * [Rules based on the counterparty](#rules-based-on-the-counterparty)
    * [Rules based on the asset or the contract definition](#rules-based-on-the-asset-or-the-contract-definition)
    * [Rules as Java policy functions](#rules-as-java-policy-functions)
  * [Held negotiations](#held-negotiations)
  * [Approving and rejecting](#approving-and-rejecting)
  * [Getting notified](#getting-notified)
  * [Custom pending guards](#custom-pending-guards)
  * [Limitations](#limitations)
<!-- TOC -->

## Overview

By default, a provider accepts every contract request whose offer passes policy evaluation, and the contract
negotiation moves straight on to the agreement. Many dataspaces need a human (or an external system) to approve
some negotiations first, for example requests from counterparties that are not known business partners.

With contract negotiation approval, a provider negotiation in the `REQUESTED` state can be **held** before the
agreement is sent. Whether a negotiation needs approval is decided by the [policy engine](../_index.md): the
contract policy is evaluated in a dedicated scope, and a negotiation that does not pass it waits until it is
approved or rejected through the Management API.

Approval works with both control plane flavours: the classic runtime (state machine) and the virtual runtime
(task executor). See the
[decision record](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-10-07-contract-negotiation-approval)
for the rationale.

## Enabling approval

Approval is opt-in and disabled by default:

| Setting                            | Default | Description                                                                 |
|------------------------------------|---------|-----------------------------------------------------------------------------|
| `edc.negotiation.approval.enabled` | `false` | Holds provider negotiations whose contract policy fails the approval scope |

The setting applies to the whole runtime. In a virtual runtime it is enabled for all participant contexts, but
only negotiations whose contract policy contains approval constraints can actually be held (see below).

## Writing approval rules

### The approval scope

When a provider negotiation is in `REQUESTED`, the contract policy stored on the negotiation (the policy of the
last contract offer) is evaluated in the `approval.contract.negotiation`
[scope](../_index.md#policy-scopes-and-bindings):

- the evaluation **succeeds**: the negotiation is approved automatically and proceeds to the agreement;
- the evaluation **fails**: the negotiation is held for manual approval.

Only constraints explicitly bound to `approval.contract.negotiation` are evaluated, with a CEL expression whose
`scopes` contain it or with a Java function bound to it. The scope deliberately does not start with
`contract.negotiation`, so it does **not** inherit the rules bound to the contract negotiation scope: those were already
checked when the request was received. All other constraints are filtered out, so a contract policy without approval
constraints always passes, and existing offers are not affected.

Approval constraints are part of the contract policy, so the consumer always sees them in the catalog and in the
contract agreement, like any other constraint of that policy. What the constraint reveals is up to the provider: it can
declare the approval openly, or be an opaque reference to a rule whose criteria stay on the provider side.

### What approval rules can use

Approval rules are evaluated by the provider, against the following data:

| Data                                                                               | CEL                      | Java (`ApprovalContractNegotiationPolicyContext`) |
|------------------------------------------------------------------------------------|--------------------------|---------------------------------------------------|
| The constraint being evaluated (left operand, operator, right operand)             | `this`                   | the function arguments                            |
| The counterparty's identity and the claims of its last contract request            | `ctx.agent`              | `participantAgent()`                              |
| The participant context, for the partner functions                                 | `ctx.partners`           | `participantContextId()`                          |
| The negotiated asset: `{ id, participantContextId, properties, privateProperties }` | `ctx.asset`              | `asset()` (`AssetPolicyContext`)                  |
| The contract definition that offered it: `{ id, participantContextId, accessPolicyId, contractPolicyId, privateProperties, assetsSelector }` | `ctx.contractDefinition` | `contractDefinition()` (`ContractDefinitionPolicyContext`) |

A few things to keep in mind:

- there is no incoming request when the rule is evaluated. The counterparty's claims are the ones captured, and
  verified, when the provider received its last contract request: they are stored on the negotiation and refreshed on
  every request of the counterparty;
- private properties of the asset and of the contract definition are available, as the rules are evaluated by the
  provider only. The data address of the asset is not exposed;
- when the asset or the contract definition does not exist anymore, it is not available: rules reading it fail, and
  the negotiation is held;
- property keys are expanded IRIs, so they are accessed with the map syntax, e.g.
  `ctx.asset.properties['https://w3id.org/edc/v0.0.1/ns/manualApproval']`. Reading an absent key aborts the
  evaluation, so check it with `in` first.

### Public rules: declaring manual approval in the offer

The simplest way to require manual approval is to declare it in the offer itself. The contract policy carries a
constraint whose meaning is explicit, and a single CEL expression evaluates its right operand. The consumer reads in
the catalog that negotiating this offer needs a manual approval by the provider, and can plan for it.

Register the expression once ([celexpression.manualapproval.json](./celexpression.manualapproval.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CelExpression",
  "leftOperand": "https://w3id.org/example/approval/manualApproval",
  "expression": "this.rightOperand != 'required'",
  "description": "Holds the negotiations of the offers that declare a required manual approval",
  "scopes": [
    "approval.contract.negotiation"
  ]
}
```

and declare the approval in the contract policies that need it
([policy.manualapproval.json](./policy.manualapproval.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "PolicyDefinition",
  "policy": {
    "@type": "Set",
    "permission": [
      {
        "action": "use",
        "constraint": {
          "leftOperand": "https://w3id.org/example/approval/manualApproval",
          "operator": "eq",
          "rightOperand": "required"
        }
      }
    ]
  }
}
```

The decision depends only on what the offer declares: negotiations of offers with `manualApproval eq required` are
held, while offers that declare another value (or no `manualApproval` constraint at all) are approved automatically.

### Rules based on the counterparty

Rules can also decide based on who is negotiating, keeping the criteria private: the constraint in the contract policy
only references the rule. The following expression ([celexpression.approval.json](./celexpression.approval.json)) only
lets negotiations from an allow list of counterparties through without approval:

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CelExpression",
  "leftOperand": "https://w3id.org/example/approval/TrustedCounterParty",
  "expression": "ctx.agent.id in ['did:web:partner-a.example.com', 'did:web:partner-b.example.com']",
  "description": "Negotiations from counterparties outside the allow list need manual approval",
  "scopes": [
    "approval.contract.negotiation"
  ]
}
```

The contract policy then references the same left operand ([policy.approval.json](./policy.approval.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "PolicyDefinition",
  "policy": {
    "@type": "Set",
    "permission": [
      {
        "action": "use",
        "constraint": {
          "leftOperand": "https://w3id.org/example/approval/TrustedCounterParty",
          "operator": "eq",
          "rightOperand": "true"
        }
      }
    ]
  }
}
```

A request from `did:web:partner-a.example.com` is agreed automatically, any other counterparty is held.

If partners and partner groups are available in the runtime, the same rule can be expressed without hard-coding
identities:

```
ctx.partners.byIdentity(ctx.agent.id).inGroup('trusted')
```

Rules can also rely on the counterparty's credentials, through the claims stored on the negotiation and the
[Verifiable Credential helper functions](../cel/_index.md#verifiable-credential-helper-functions). With Decentralized
Claims (DCP), the following expression approves automatically the negotiations of counterparties holding a valid,
active `MembershipCredential`, and holds all the others:

```
ctx.agent.claims.vc.valid().withType('MembershipCredential').hasClaim('status', 'active')
```

### Rules based on the asset or the contract definition

Rules can depend on what is negotiated: the asset, for a check on a single asset, or the contract definition that
offered it, for a rule shared by all its assets. The following expression holds the negotiations of the assets with a
`manualApproval` property:

```
!('https://w3id.org/edc/v0.0.1/ns/manualApproval' in ctx.asset.properties)
```

and this one holds all the negotiations of the contract definitions with a `manualApproval` private property:

```
!('https://w3id.org/edc/v0.0.1/ns/manualApproval' in ctx.contractDefinition.privateProperties)
```

The data can be combined with the counterparty, e.g. to require approval for the assets with a `manualApproval`
property, unless the counterparty is a trusted partner:

```
!('https://w3id.org/edc/v0.0.1/ns/manualApproval' in ctx.asset.properties)
    || ctx.partners.byIdentity(ctx.agent.id).inGroup('trusted')
```

### Rules as Java policy functions

Approval rules can also be implemented as regular policy functions. Bind the left operand to the approval scope, and
register the function for `ApprovalContractNegotiationPolicyContext` to access the asset and the contract definition:

```java
public class ApprovalExtension implements ServiceExtension {

    private static final String TRUSTED_KEY = "https://w3id.org/example/approval/TrustedCounterParty";

    @Inject
    private PolicyEngine policyEngine;

    @Override
    public void initialize(ServiceExtensionContext context) {
        policyEngine.bindScope(TRUSTED_KEY, ApprovalContractNegotiationPolicyContext.APPROVAL_SCOPE);
        policyEngine.registerFunction(ApprovalContractNegotiationPolicyContext.class, Permission.class, TRUSTED_KEY,
                (operator, rightValue, permission, ctx) -> isTrusted(ctx.participantAgent().getIdentity(), ctx.asset()));
    }
}
```

Functions registered for `ContractNegotiationPolicyContext` are used for the approval scope too, as the approval
context extends it. They can check `ctx instanceof AssetPolicyContext` or `ctx instanceof ContractDefinitionPolicyContext`
to access the asset and the contract definition.

## Held negotiations

A held negotiation stays in the `REQUESTED` state with `pending` set to `true`, which is now part of the contract
negotiation returned by the Management API:

```json
{
  "@type": "ContractNegotiation",
  "@id": "a5a8b9f2-6a2c-4a39-9d55-0b6d1cdbbd0e",
  "type": "PROVIDER",
  "state": "REQUESTED",
  "pending": true,
  "counterPartyId": "did:web:unknown.example.com"
}
```

A `contract.negotiation.held` event is published when a negotiation is held. Held negotiations can be listed with
the contract negotiation query endpoint, using the filter `pending = true`.

## Approving and rejecting

A held negotiation is approved or rejected with the following endpoints:

| Management API | Endpoint                                                                         |
|----------------|----------------------------------------------------------------------------------|
| v5             | `POST /v5/participants/{participantContextId}/contractnegotiations/{id}/approve` |
| v5             | `POST /v5/participants/{participantContextId}/contractnegotiations/{id}/reject`  |
| v4             | `POST /v4/contractnegotiations/{id}/approve`                                     |
| v4             | `POST /v4/contractnegotiations/{id}/reject`                                      |

Approve has no request body. Reject requires the following body:

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "RejectNegotiation"
}
```

Both operations only apply to a **provider** negotiation in the `REQUESTED` state that is **pending**: any other
negotiation results in a `409 Conflict`. On the v5 API they require the `management-api:negotiations:write` scope.

- **Approve** moves the negotiation to `AGREEING`, and the agreement is sent to the consumer. A
  `contract.negotiation.approved` event is published.
- **Reject** moves the negotiation to `TERMINATING`, and a termination message is sent to the consumer. A
  `contract.negotiation.rejected` event is published.

> The termination reason is sent to the counterparty, so a rejection always uses the fixed reason
> `Negotiation manually rejected`, to avoid disclosing any provider-internal information.

## Getting notified

The `contract.negotiation.held`, `contract.negotiation.approved` and `contract.negotiation.rejected` events can be
delivered to an external system, such as an approval UI, with callbacks. Provider negotiations are created from
protocol messages, so they have no per-request callback addresses: use
[participant callbacks](../../../observability/_index.md#4-participant-callbacks) or
[static callbacks](../../../observability/_index.md#3-static-callbacks) instead. For example, the following
participant callback (a participant context configuration entry in the virtual runtime, a runtime setting in the
classic runtime) receives the held negotiations:

```properties
edc.callbacks=[{"uri": "https://approvals.example.com/hook", "events": ["contract.negotiation.held"], "transactional": false}]
```

The callback receives the event with the id of the provider negotiation (`payload.contractNegotiationId`), which
is the id to use with the approve and reject endpoints.

## Custom pending guards

Approval is built on the contract negotiation pending guards. Extensions can hold negotiations with their own
logic by registering a `ContractNegotiationPendingGuard` in the `ContractNegotiationPendingGuardRegistry`. All the
registered guards are evaluated, and a negotiation is held when any of them matches. Providing a single
`ContractNegotiationPendingGuard` as a service still works but is deprecated in favour of the registry.

Note that the approve and reject endpoints only apply to provider negotiations held in `REQUESTED`: negotiations
held by custom guards in other states need to be resumed by the extension itself.

## Limitations

- Only provider negotiations in the `REQUESTED` state can be approved; consumer-side approval, approval in other
  states and transfer process approval are not supported.
- The claims used for approval are the ones of the latest contract request received by the provider: they are not
  verified again when the negotiation is approved.
- `edc.negotiation.approval.enabled` applies to the whole runtime.
