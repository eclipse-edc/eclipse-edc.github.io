---
title: Partners and Partner Groups
description: Record the counter-parties a participant knows and group them, then use them in policies.
weight: 25
---

<!-- TOC -->
  * [Overview](#overview)
  * [Managing partners and groups](#managing-partners-and-groups)
  * [Using partners in CEL expressions](#using-partners-in-cel-expressions)
  * [Using partners in Java policy functions](#using-partners-in-java-policy-functions)
  * [Related](#related)
<!-- TOC -->

## Overview

Policies often depend on who the counter-party is to the provider: a customer of a given tier, a partner with a
contract number, a member of an allow-list. **Partners** and **partner groups** record this knowledge per participant
context, so that policies can use it without custom code:

- a `PartnerGroup` has an id, a `name`, a `description` and free-form `properties`, e.g. `gold-customers`;
- a `Partner` has an id, the `identity` of the counter-party (its id in the dataspace, e.g. its DID, as the dataspace
  profile extracts it from the verified token), a `name`, free-form `properties`, e.g. a customer number, and the
  `groupIds` of the groups it belongs to.

Partners and groups belong to one participant context. Within it, a partner's `identity` is unique, a partner can only
reference existing groups, and a group can't be deleted while partners reference it (`409`).

Partners are available in the multi-participant runtime (module `partner-cel`, in `controlplane-virtual-base-bom`),
stored in SQL with `controlplane-virtual-feature-sql-bom` (`edc.sql.store.partner.datasource`).

## Managing partners and groups

The v5 Management API manages them, with the scopes `management-api:partners:read` and `management-api:partners:write`:

| Resource | Endpoints |
|---|---|
| Partner groups | `POST /v5/participants/{participantContextId}/partnergroups`, `GET`, `PUT`, `DELETE …/partnergroups/{id}`, `POST …/partnergroups/request` (query) |
| Partners | `POST /v5/participants/{participantContextId}/partners`, `GET`, `PUT`, `DELETE …/partners/{id}`, `POST …/partners/request` (query) |

```json
{
  "@context": [ "https://w3id.org/edc/connector/management/v2" ],
  "@type": "PartnerGroup",
  "@id": "gold",
  "name": "Gold customers"
}
```

```json
{
  "@context": [ "https://w3id.org/edc/connector/management/v2" ],
  "@type": "Partner",
  "@id": "partner-0001",
  "identity": "did:web:customer.example.com",
  "name": "Customer Inc.",
  "properties": {
    "businessId": "BID-0001"
  },
  "groupIds": [ "gold" ]
}
```

Partners can be queried by their properties (`properties.businessId = BID-0001`) and by group
(`groupIds contains gold`).

## Using partners in CEL expressions

[CEL expressions](../cel/_index.md) evaluated in the `catalog`, `contract.negotiation`,
`approval.contract.negotiation`, `transfer.process` and `policy.monitor` scopes get a `ctx.partners` handle, which
looks up the partners of the participant context the policy is evaluated for:

| Expression | Result |
|---|---|
| `ctx.partners.byIdentity(s)` | the partner with the identity `s` |
| `ctx.partners.byId(s)` | the partner with the id `s` |
| `ctx.partners.query({'businessId': 'X'})` | the partners whose properties match all the given values (at most 1000) |
| `p.inGroup(s)` | whether the partner `p` belongs to the group `s` |
| `p.groups` | the group ids of the partner `p` |
| `p.found` | whether the partner exists |

A lookup never fails: an unknown partner has `found == false` and no groups. An expression that grants access to the
members of a group is therefore simply:

```
ctx.partners.byIdentity(ctx.agent.id).inGroup('gold')
```

Because the expression is evaluated again in the `policy.monitor` scope, removing a partner from the group also
terminates its running transfers that depend on it. The [contract negotiation approval](../negotiation-approval/_index.md)
uses the same handle to decide which negotiations need a manual approval.

## Using partners in Java policy functions

Custom policy functions inject the `PartnerService` and look up partners with `findById`, `findByIdentity` or `search`,
with the participant context id of the policy context (`ParticipantContextPolicyContext`).

## Related

- [CEL Policy Expressions](../cel/_index.md)
- [Contract Negotiation Approval](../negotiation-approval/_index.md)
- Decision record: [partners and partner groups](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-09-22-partners-and-partner-groups)
