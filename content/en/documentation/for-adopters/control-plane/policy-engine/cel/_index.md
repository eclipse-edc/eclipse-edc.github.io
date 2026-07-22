---
title: CEL Policy Expressions
description: Enforce policy constraints declaratively with Common Expression Language, without writing Java.
weight: 20
---

<!-- TOC -->
  * [Overview](#overview)
  * [How CEL expressions are bound](#how-cel-expressions-are-bound)
    * [Scopes](#scopes)
    * [Binding by action](#binding-by-action)
  * [Managing expressions with the Management API](#managing-expressions-with-the-management-api)
    * [Creating an expression](#creating-an-expression)
    * [Testing an expression](#testing-an-expression)
  * [The evaluation context](#the-evaluation-context)
  * [Verifiable Credential helper functions](#verifiable-credential-helper-functions)
    * [The credential shape](#the-credential-shape)
    * [Available functions](#available-functions)
  * [End-to-end example](#end-to-end-example)
  * [Configuration](#configuration)
  * [Extending with custom functions](#extending-with-custom-functions)
<!-- TOC -->

## Overview

The EDC [policy engine](../_index.md) takes a code-first approach: policy constraints are evaluated by Java functions
contributed as extensions. **CEL** ([Common Expression Language](https://github.com/google/cel-spec)) offers a
declarative alternative. Instead of writing, compiling, and deploying a Java function, you register a CEL
expression as a piece of data and bind it to a policy's left operand. The policy engine evaluates it through a
single dynamic constraint function, so no code needs to be shipped to add or change a rule.

This is particularly useful for credential-based access rules — "the counterparty must hold a valid membership
credential issued by X" — which would otherwise each require a dedicated policy function.

> CEL support is **experimental** and they are bundled in the edc virtual bundles (BOMs). See the
> [decision record](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-01-27-adopt-cel-expressions)
> for the rationale, and the [contributor documentation](../../../../for-contributors/control-plane/entities/_index.md#27-common-expression-language-cel-policy-functions)
> for the developer-facing details and how to add your own functions.

## How CEL expressions are bound

A CEL expression is stored as a `CelExpression` with, among other fields, a **left operand** and a CEL
**expression** string. The link to a policy is the left operand: an ODRL `AtomicConstraint`'s `leftOperand`
must be **identical** to the `leftOperand` of a registered `CelExpression`. When the policy engine reaches a
constraint whose left operand matches a stored expression, it evaluates that expression instead of dispatching
to a code-based function.

Left operands are conventionally IRIs, for example
`https://w3id.org/example/credentials/MembershipCredential`. The value is opaque to the engine — it is only
used as a lookup key — but using a stable, namespaced IRI avoids collisions.

### Scopes

Policy rules are only evaluated in the [scopes](../_index.md#policy-scopes-and-bindings) they are bound to. A
`CelExpression` declares a set of `scopes`, and the engine binds the expression to exactly those policy phases:

| Scope value            | Policy phase                    |
|------------------------|---------------------------------|
| `catalog`              | catalog request                 |
| `contract.negotiation` | contract negotiation            |
| `transfer.process`     | transfer process                |
| `policy.monitor`       | policy monitor (ongoing checks) |

If `scopes` is left empty it defaults to `*.` (match all scopes). Restrict the scopes to the phases where the
check is actually needed — for example, verifying a membership credential during negotiation but not again
during provisioning — to avoid redundant evaluation.

### Binding by action

In addition to the left operand, an expression may declare a set of `actions`. An expression is also bound
when the evaluated action matches one of its `actions` entries. This lets a single expression apply across
constraints that share an action rather than a single left operand.

## Managing expressions with the Management API

CEL expressions are managed through the `cel-api-v5` extension under the `/v5beta/celexpressions` path of the
[Management API](../../_index.md#management-api). All operations require the `management-api:admin` authorization scope.

| Operation | Request                             |
|-----------|-------------------------------------|
| Create    | `POST /v5beta/celexpressions`         |
| Query     | `POST /v5beta/celexpressions/request` |
| Get by id | `GET /v5beta/celexpressions/{id}`     |
| Update    | `PUT /v5beta/celexpressions/{id}`     |
| Delete    | `DELETE /v5beta/celexpressions/{id}`  |
| Test      | `POST /v5beta/celexpressions/test`    |

The field-by-field schemas are in the
[OpenAPI reference](https://eclipse-edc.github.io/Connector/openapi/management-api/); the essentials are below.

### Creating an expression

The request body is a JSON-LD `CelExpression`. Required fields are `@context`, `@type`, `leftOperand`,
`expression`, and `description`; `@id` (a UUID is generated if omitted), `scopes`, and `actions` are optional.

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CelExpression",
  "leftOperand": "https://w3id.org/example/credentials/MembershipCredential",
  "expression": "ctx.agent.claims.vc.valid().withType('MembershipCredential').hasClaim('status', 'active')",
  "description": "Requires a valid MembershipCredential whose subject status is active",
  "scopes": [
    "catalog",
    "contract.negotiation",
    "transfer.process"
  ]
}
```

Create returns an `IdResponse` (the `@id` and `createdAt`); `GET` and query return the full object. A sample
body is available at [celexpression.membership.json](./celexpression.membership.json).

### Testing an expression

Before binding an expression to a live policy, you can dry-run it with `POST /v5beta/celexpressions/test`. The
request carries the `expression`, the constraint triple (`leftOperand`, `operator`, `rightOperand`), and a
`params` map that stands in for the evaluation context. The response contains a boolean `evaluationResult` (or
an `error` if the expression failed to compile or evaluate):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CelExpressionTestRequest",
  "leftOperand": "https://w3id.org/example/credentials/MembershipCredential",
  "expression": "ctx.agent.id == 'did:web:consumer'",
  "operator": "EQ",
  "rightOperand": "active",
  "params": {
    "agent": {
      "id": "did:web:consumer"
    }
  }
}
```

## The evaluation context

Expressions are evaluated against a set of bound variables. What is available depends on the scope:

| Variable        | Shape                                                                                 | Available in                                     |
|-----------------|---------------------------------------------------------------------------------------|--------------------------------------------------|
| `ctx.agent`     | `{ id, attributes, claims }` — the counterparty; `claims.vc` is the credential list   | catalog, contract.negotiation, transfer.process  |
| `ctx.agreement` | `{ id, assetId, providerId, consumerId, agreementId, contractSigningDate }`           | transfer.process, policy.monitor                 |
| `this`          | `{ leftOperand, operator, rightOperand }` — the ODRL constraint triple being evaluated | all scopes                                        |
| `now`           | the current timestamp                                                                 | all scopes                                        |

`this.rightOperand` is the value declared on the policy constraint, so an expression can compare against it
rather than hard-coding a value. Note that `ctx.agent` is **not** available in the `policy.monitor` scope,
which only exposes `ctx.agreement`.

_In CEL, reading a map key that is absent aborts evaluation with an error — it does not return `false`. Guard
raw map access with the `has()` macro, or prefer the Verifiable Credential helper functions below, which are
written to return "no match" instead of erroring on missing data._

## Verifiable Credential helper functions

When using [Decentralized Claims (DCP)](../../../identity-hub/_index.md), the counterparty's verified credentials are
exposed to expressions as `ctx.agent.claims.vc`. The `decentralized-claims-cel` extension registers a set of
helper functions that make credential checks concise and safe. All of them are **null- and shape-safe**: a
missing key, an absent credential, or a wrongly-typed value yields "no match" rather than an evaluation error.

Without the helpers, a credential check is a nested `filter`/`exists` expression:

```
ctx.agent.claims.vc.filter(c, c.type.exists(t, t == 'MembershipCredential'))
                   .exists(c, c.credentialSubject.exists(cs, cs.memberOf == 'Catena-X'))
```

With the helpers, the same check reads:

```
ctx.agent.claims.vc.withType('MembershipCredential').hasClaim('memberOf', 'Catena-X')
```

### The credential shape

Each entry in `ctx.agent.claims.vc` is a map with these keys:

| Key                 | Type                | Notes                                                        |
|---------------------|---------------------|--------------------------------------------------------------|
| `id`                | string              |                                                              |
| `type`              | list of strings     |                                                              |
| `@context`          | list of strings     |                                                              |
| `issuer`            | map                 | `{ id, ...additionalProperties }`                            |
| `issuanceDate`      | string (ISO-8601)   |                                                              |
| `expirationDate`    | string (ISO-8601)   | present only if the credential declares one                  |
| `credentialSubject` | list of maps        | each is the subject's claims, with its `id` merged in        |

### Available functions

The functions below take the credential list (`ctx.agent.claims.vc`) as their receiver:

| Function                   | Result | Meaning                                                         |
|----------------------------|--------|-----------------------------------------------------------------|
| `withType(t)`              | list   | credentials whose `type` contains `t`                           |
| `withContext(c)`           | list   | credentials whose `@context` contains `c`                       |
| `withIssuer(id)`           | list   | credentials issued by `id`                                      |
| `valid()`                  | list   | credentials already issued and not expired                      |
| `hasCredential(t)`         | bool   | whether any credential has type `t`                             |
| `hasClaim(name)`           | bool   | whether any subject has a claim `name`                          |
| `hasClaim(name, value)`    | bool   | whether any subject's claim `name` equals `value`               |
| `claim(name)`              | dyn    | the first value of subject claim `name`, or `null`              |
| `claims(name)`             | list   | all values of subject claim `name`                              |

`withType`, `withIssuer`, `withContext`, and `valid` return a filtered list, so they chain:
`ctx.agent.claims.vc.valid().withType('MembershipCredential').hasClaim('status', 'active')`.

A matching set of single-credential overloads (`hasType`, `hasContext`, `hasClaim`, `claim`, `valid`) take a
single credential as receiver, so they compose with the standard CEL macros:

```
ctx.agent.claims.vc.exists(c, c.hasType('MembershipCredential') && c.valid())
```

`claim`/`hasClaim` names may be **dotted paths** to reach nested subject claims (`degree.type`). The whole name
is tried as a literal key first, so credential claim keys that are themselves IRIs (and contain dots) remain
addressable.

`valid()` mirrors the credential validity rule applied by the verification pipeline (a credential is valid once
issued and until it expires). In the standard DCP flow credentials have already been validated before reaching
the policy engine, so `valid()` is a defence-in-depth check.

## End-to-end example

Enforcing "the counterparty must present a valid, active membership credential" takes two objects that share a
left operand.

First, register the CEL expression ([celexpression.membership.json](./celexpression.membership.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CelExpression",
  "leftOperand": "https://w3id.org/example/credentials/MembershipCredential",
  "expression": "ctx.agent.claims.vc.valid().withType('MembershipCredential').hasClaim('status', 'active')",
  "description": "Requires a valid MembershipCredential whose subject status is active",
  "scopes": [
    "catalog",
    "contract.negotiation",
    "transfer.process"
  ]
}
```

Then reference the same left operand from a policy constraint
([policy.cel.membership.json](./policy.cel.membership.json)):

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
          "leftOperand": "https://w3id.org/example/credentials/MembershipCredential",
          "operator": "eq",
          "rightOperand": "active"
        }
      }
    ]
  }
}
```

When this policy is evaluated in any of the declared scopes, the engine finds the CEL expression by its left
operand and evaluates it against the counterparty's credentials. Because the expression's `scopes` include
`catalog`, `contract.negotiation`, and `transfer.process`, the same rule is enforced when the catalog is
requested, when a contract is negotiated, and when a transfer starts.

## Configuration

CEL adds a single configuration setting, and only when the SQL store is used:

| Setting                          | Default   | Description                                    |
|----------------------------------|-----------|------------------------------------------------|
| `edc.sql.store.cel.datasource`   | `default` | The datasource used by the SQL expression store |

## Extending with custom functions

The Verifiable Credential helpers are themselves custom functions registered by the `decentralized-claims-cel`
extension — you can add your own the same way. This is a developer task; see the
[contributor documentation](../../../../for-contributors/control-plane/entities/_index.md#27-common-expression-language-cel-policy-functions)
for how to implement and register a `CelFunction`.
