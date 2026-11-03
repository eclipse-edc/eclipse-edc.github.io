---
title: Participant Contexts
description: Run one control plane for many dataspace participants, manage their lifecycle and configure each of them.
weight: 5
---

<!-- TOC -->
  * [Overview](#overview)
  * [Single and multi-participant runtimes](#single-and-multi-participant-runtimes)
  * [Managing participant contexts](#managing-participant-contexts)
    * [Lifecycle](#lifecycle)
  * [Resources of a participant context](#resources-of-a-participant-context)
  * [Dataspace Protocol endpoints](#dataspace-protocol-endpoints)
  * [Participant context configuration](#participant-context-configuration)
    * [Setting the configuration](#setting-the-configuration)
    * [Private entries](#private-entries)
    * [Validation](#validation)
    * [Configuration keys](#configuration-keys)
  * [Related](#related)
<!-- TOC -->

## Overview

A **participant context** represents one dataspace participant hosted by a control plane: its identity in the
dataspace, its configuration, and every resource it owns (assets, policies, contract definitions, negotiations,
agreements, transfer processes, data planes, partners). One control plane runtime can host many participant contexts,
each isolated from the others, which lets an operator run a shared, multi-tenant connector instead of one connector per
participant.

A participant context has:

- an `@id`, the participant context id, which appears in the Management API paths and in the Dataspace Protocol (DSP)
  endpoints of the participant;
- an `identity`, the id of the participant in the dataspace, e.g. its DID, as other participants see it;
- a `state`: `CREATED`, `ACTIVATED` or `DEACTIVATED`;
- free-form `properties`;
- a [configuration](#participant-context-configuration), a set of key/value entries that configure the participant's
  services, e.g. its identity provider or its vault.

## Single and multi-participant runtimes

EDC can be assembled in two modes, which can't be combined in one runtime:

| | Single participant ("classic") | Multi-participant ("virtual") |
|---|---|---|
| BOM | `controlplane-base-bom` | `controlplane-virtual-base-bom` (task-based state machines) or `controlplane-virtual-poll-base-bom` (poll-based), plus `controlplane-virtual-feature-sql-bom`, `-dcp-bom`, `-nats-bom` |
| Participant contexts | one, defined by the runtime configuration | any number, managed through the Management API |
| Configuration of the participant | the runtime configuration | the participant context configuration, stored in the database |
| Management API | v4, authenticated with an API key | v5, authenticated with OAuth2 tokens and [scopes](../management-api/_index.md) |
| DSP endpoints | one set per runtime | one set per participant context and [dataspace profile](../dataspace-profiles/_index.md) |

In a single participant runtime, the participant context is created from the settings `edc.participant.id` (the
identity) and `edc.participant.context.id` (the id, defaults to the identity), and the runtime configuration doubles as
its participant context configuration. The runtime refuses to start if the multi-participant Management API
authorization is also present.

## Managing participant contexts

In a multi-participant runtime, participant contexts are managed through the v5 Management API, with a token that has
the `management-api:admin` scope:

| Operation | Endpoint |
|---|---|
| Create | `POST /v5/participants` |
| List | `GET /v5/participants?offset=0&limit=50` |
| Read, update, delete | `GET`, `PUT`, `DELETE /v5/participants/{participantContextId}` |
| Activate, deactivate | `POST /v5/participants/{participantContextId}/activate`, `…/deactivate` |

```json
{
  "@context": [ "https://w3id.org/edc/connector/management/v2" ],
  "@type": "ParticipantContext",
  "@id": "acme",
  "identity": "did:web:acme.example.com",
  "properties": {
    "displayName": "ACME Corp."
  }
}
```

### Lifecycle

A participant context is `CREATED` when it is created, and can be moved to `ACTIVATED` and `DEACTIVATED` and back. Only
`DEACTIVATED` changes the behaviour of the runtime:

- the participant's DSP endpoints answer `404`, as if the participant didn't exist;
- its tokens are rejected by the Management API, unless they have the admin scope.

Deactivating a participant context doesn't terminate its running contract negotiations and transfer processes: they
continue, but the counter-parties can't reach the participant until it is activated again.

## Resources of a participant context

Every resource belongs to one participant context and is identified by the participant context id and its own id: two
participant contexts can each have an asset with the id `asset-1`, and the SQL stores use composite primary keys. The
v5 Management API scopes all resource paths by participant context, e.g.
`/v5/participants/{participantContextId}/assets`, and a token without the admin scope can only access the resources of
the participant context in its `sub` claim (see [Management API](../management-api/_index.md)).

## Dataspace Protocol endpoints

In a multi-participant runtime, the DSP endpoints of a participant context are served under its id and the
[dataspace profile](../dataspace-profiles/_index.md) used for the exchange, on the protocol API context:

- `/{participantContextId}/{profileId}/catalog`, `…/negotiations`, `…/transfers`;
- `/{participantContextId}/.well-known/dspace-version` for the version metadata.

The dataspace profiles a participant context may use are set in its configuration (`edc.dataspace.profiles`), or all
profiles of the runtime with `edc.dataspace.enable.profiles.all=true`.

## Participant context configuration

Services read their participant-specific settings from the participant context configuration, e.g. which identity
provider (STS) issues the participant's tokens, or which vault partition stores its secrets. A configuration has
`entries`, stored in clear text, and `privateEntries`, for secrets.

### Setting the configuration

The configuration API requires the `management-api:admin` scope:

| Operation | Endpoint |
|---|---|
| Replace the configuration | `PUT /v5/participants/{participantContextId}/config` |
| Change some entries | `PATCH /v5/participants/{participantContextId}/config` |
| Read the configuration | `GET /v5/participants/{participantContextId}/config` |
| Check the configuration | `GET /v5/participants/{participantContextId}/config/validation` |

```json
{
  "@context": [ "https://w3id.org/edc/connector/management/v2" ],
  "@type": "ParticipantContextConfig",
  "entries": {
    "edc.participant.id": "did:web:acme.example.com",
    "edc.iam.sts.type": "oauth",
    "edc.iam.sts.oauth.token.url": "https://sts.example.com/token",
    "edc.iam.sts.oauth.client.id": "acme",
    "edc.iam.sts.oauth.client.secret.alias": "acme-sts-secret"
  },
  "privateEntries": {
    "edc.vault.hashicorp.config": "{ ... }"
  }
}
```

`PATCH` merges the request into the stored configuration
([JSON merge patch](https://www.rfc-editor.org/rfc/rfc7396)): the entries it contains are added or replaced, an entry
set to `null` is removed, the others are left as they are. Several parties can therefore complete a configuration with
separate patches, e.g. a provisioning agent that sets the identity and another that sets the vault.

### Private entries

`privateEntries` hold secrets. They are encrypted before they are stored, with the algorithm set in
`edc.participants.config.encryption.algorithm`. EDC ships the `aes` algorithm (module `aes-encryption`, part of the
virtual BOM), whose key is read from the vault under the alias `edc.encryption.aes.key.alias`. Without an algorithm,
private entries are stored as they are, so set one in production.

### Validation

Extensions register the configuration keys they read, with their format, whether they are required, and whether they
are secret. The configuration is checked against these registrations:

- `PUT` rejects a configuration with an invalid value, a missing required key, or a secret key in `entries` instead of
  `privateEntries` (`400`);
- `PATCH` checks the values it contains, but not missing keys, since a configuration may be completed by several
  patches;
- `GET …/config/validation` reports whether the stored configuration is complete, with the list of violations.

Keys that no extension registered are accepted, unless `edc.participants.config.validation.strict=true`.

### Configuration keys

The keys registered by the extensions shipped with EDC:

| Key | Description |
|---|---|
| `edc.participant.id` | the id of the participant, used as its DID |
| `edc.participant.did` | the DID of the participant, required if `edc.participant.id` is not set |
| `edc.dataspace.profiles` | comma-separated list of the [dataspace profiles](../dataspace-profiles/_index.md) of the participant |
| `edc.iam.sts.type` | the STS issuing the participant's self-issued tokens: `oauth` (a remote STS, e.g. IdentityHub's) or `signature` (signed by the control plane's signature service, e.g. Vault Transit, so that the key never leaves it); defaults to `edc.iam.sts.default.type` (`oauth`) |
| `edc.iam.sts.oauth.token.url`, `edc.iam.sts.oauth.client.id`, `edc.iam.sts.oauth.client.secret.alias` | token endpoint, client id and vault alias of the client secret, required for the `oauth` STS |
| `edc.iam.sts.signature.keyname`, `edc.iam.sts.signature.kid` | name of the signing key in the signature service and key id set on the tokens, required for the `signature` STS (token validity: `edc.iam.sts.signature.token.expiration`, 600 s) |
| `edc.vault.hashicorp.config` | secret: JSON settings of the participant's HashiCorp Vault partition |
| `edc.callbacks` | JSON array of the [callbacks](../../observability/_index.md) notified of the participant's events |

## Related

- [Management API](../management-api/_index.md): versions, authentication and scopes.
- [Dataspace Profiles](../dataspace-profiles/_index.md): the protocols and identity settings a participant uses.
- Decision records: [participant context](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2025-08-26-participant-context),
  [participant context configuration](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2025-10-15-participant-context-config),
  [per-participant resource ids](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-09-22-per-participant-resource-ids).
