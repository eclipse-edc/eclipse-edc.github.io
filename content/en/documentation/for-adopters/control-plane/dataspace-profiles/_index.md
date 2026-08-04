---
title: Dataspace Profiles
description: Register custom dataspace profiles, attach them to participant contexts, and wire their DCP scopes and JSON-LD contexts through the Management API.
weight: 20
---

<!-- TOC -->
  * [Overview](#overview)
  * [Anatomy of a profile](#anatomy-of-a-profile)
  * [Registering a profile](#registering-a-profile)
    * [With the Management API](#with-the-management-api)
    * [With configuration](#with-configuration)
  * [Associating a profile with a participant context](#associating-a-profile-with-a-participant-context)
    * [Enabling all profiles](#enabling-all-profiles)
  * [Configuring DCP scopes](#configuring-dcp-scopes)
    * [With the Management API](#with-the-management-api-1)
    * [With configuration](#with-configuration-1)
  * [Caching JSON-LD contexts](#caching-json-ld-contexts)
    * [With the Management API](#with-the-management-api-2)
    * [With mounted files](#with-mounted-files)
  * [Validating profile policies with JSON Schema](#validating-profile-policies-with-json-schema)
  * [Putting it together](#putting-it-together)
  * [Related](#related)
<!-- TOC -->

## Overview

A **dataspace profile** describes everything a connector needs to talk to one dataspace. It bundles:

- the **wire protocol** — the Dataspace Protocol (DSP) version, binding, and JSON-LD namespace used on the
  wire;
- the **JSON-LD contexts** contributed by the dataspace's policy vocabulary, loaded for compaction and
  expansion under the profile;
- the **trusted issuers** whose Verifiable Credentials are accepted under the profile;
- and, alongside the profile, the **DCP scopes** the connector requests to obtain those credentials.

In *virtual mode* a single EDC runtime can serve several profiles at once, so one connector can participate in
multiple dataspaces side by side without leaking one dataspace's protocol, contexts, or credential requests
into another. Each registered profile is served for a participant only once that participant is
[associated with it](#associating-a-profile-with-a-participant-context).

> Multi-profile virtual mode is **experimental**. It builds on the profile-context concept and requires the EDC
> virtual bundles (BOMs). See the decision records for
> [dataspace profile context](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2025-05-28-dataspace-profile-context)
> and the
> [multi-profile virtual connector](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-05-11-multi-profile-virtual-connector)
> for the rationale.

Throughout this chapter a fictional dataspace named **Aurora** is used for the examples, with a profile named
`aurora-2025`. Replace the names, namespaces, and credential types with the ones your dataspace governance
defines.

## Anatomy of a profile

A profile is a `DataspaceProfile` object with the following fields:

| Field               | Required | Description                                                                                             |
|---------------------|----------|---------------------------------------------------------------------------------------------------------|
| `name`              | yes      | The profile id. Appears as a URL segment on the DSP endpoints and as the `protocol` string in DSP handshakes. |
| `protocol.version`  | yes      | The DSP protocol version handled by the profile (e.g. `2025-1`).                                        |
| `protocol.binding`  | yes      | The protocol binding, e.g. `HTTPS`.                                                                     |
| `protocol.namespace`| yes      | The default JSON-LD namespace for the DSP version.                                                      |
| `protocol.path`     | no       | The URL path segment for the profile. Defaults to `/{name}` when omitted.                              |
| `jsonLdContextsUrl` | no       | The JSON-LD contexts loaded for compaction/expansion under the profile.                                |
| `trustedIssuers`    | no       | The issuers accepted under the profile, each `{ "@id": <did>, "supportedTypes": [<credential type>...] }`. |

## Registering a profile

A profile can be created at runtime through the Management API, or seeded from configuration at boot. Both
paths write to the same profile store, so a profile seeded from configuration can later be updated through the
API and vice versa.

### With the Management API

Profiles are managed under the `/v5beta/dataspaceprofiles` path of the
[Management API](../_index.md#management-api).

| Operation | Request                                  | Authorization scope           |
|-----------|------------------------------------------|-------------------------------|
| Create    | `POST /v5beta/dataspaceprofiles`         | `management-api:profiles:write` |
| Update    | `PUT /v5beta/dataspaceprofiles`          | `management-api:profiles:write` |
| Query     | `POST /v5beta/dataspaceprofiles/request` | `management-api:profiles:read`  |
| Get       | `GET /v5beta/dataspaceprofiles/{name}`   | `management-api:profiles:read`  |
| Delete    | `DELETE /v5beta/dataspaceprofiles/{name}`| `management-api:profiles:write` |

The request body is a JSON-LD `DataspaceProfile` ([dataspaceprofile.aurora.json](./dataspaceprofile.aurora.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "DataspaceProfile",
  "name": "aurora-2025",
  "protocol": {
    "version": "2025-1",
    "binding": "HTTPS",
    "namespace": "https://w3id.org/dspace/2025/1/"
  },
  "jsonLdContextsUrl": [
    "https://w3id.org/dspace/2025/1/context.jsonld",
    "https://w3id.org/edc/dspace/v0.0.1",
    "https://w3id.org/aurora/2025/policy/context.jsonld",
    "https://w3id.org/aurora/2025/policy/odrl.jsonld"
  ],
  "trustedIssuers": [
    {
      "@id": "did:web:issuer.aurora.example",
      "supportedTypes": [
        "MembershipCredential",
        "DataProcessorCredential"
      ]
    }
  ]
}
```

`POST` creates the profile and returns it; it responds with `409 Conflict` if a profile with the same `name`
already exists. `PUT` **updates an existing profile only** — the profile name is taken from the body, and a
`PUT` against a name that does not exist returns `404 Not Found` (it is not an upsert). If you seed profiles
idempotently from an external job, create with `POST` and, on `409`, follow up with `PUT` to reconcile the
desired state (for example to change `trustedIssuers`).

Once the profile is registered, the DSP endpoints served by the virtual controllers become reachable under the
profile's path, per participant:

```
POST /{participantContextId}/aurora-2025/catalog/request
POST /{participantContextId}/aurora-2025/negotiations/...
POST /{participantContextId}/aurora-2025/transfers/...
```

### With configuration

The same profile can be declared at boot through the `DataspaceProfileConfigurationExtension`. Each profile is
declared under `edc.dataspace.profiles.<alias>.*`; the `<alias>` is a local config grouping key, not the
profile id itself (the id is the `name` value).

```properties
edc.dataspace.profiles.aurora.name=aurora-2025
edc.dataspace.profiles.aurora.protocol.version=2025-1
edc.dataspace.profiles.aurora.protocol.binding=HTTPS
edc.dataspace.profiles.aurora.protocol.namespace=https://w3id.org/dspace/2025/1/
edc.dataspace.profiles.aurora.jsonld.context.urls=https://w3id.org/dspace/2025/1/context.jsonld,https://w3id.org/edc/dspace/v0.0.1,https://w3id.org/aurora/2025/policy/context.jsonld,https://w3id.org/aurora/2025/policy/odrl.jsonld
# Trusted issuers (repeat the block per issuer alias)
edc.dataspace.profiles.aurora.trustedissuers.aurora-issuer.id=did:web:issuer.aurora.example
edc.dataspace.profiles.aurora.trustedissuers.aurora-issuer.supportedtypes=MembershipCredential,DataProcessorCredential
```

Configured profiles are upserted into the profile store at boot, so a later Management API `PUT` or a
subsequent config change updates the same profile.

## Associating a profile with a participant context

A profile registered at the runtime level is only served for a participant once that participant is associated
with it. Association is per-participant and is managed under
`/v5beta/participants/{participantContextId}/profiles`.

| Operation  | Request                                                | Authorization scope           |
|------------|--------------------------------------------------------|-------------------------------|
| Associate  | `PUT /v5beta/participants/{participantContextId}/profiles` | `management-api:admin`      |
| List       | `GET /v5beta/participants/{participantContextId}/profiles` | `management-api:profiles:read` |

The associate request carries an `AssociateDataspaceProfile` with the profile ids to attach
([associateprofile.aurora.json](./associateprofile.aurora.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "AssociateDataspaceProfile",
  "profiles": [
    "aurora-2025"
  ]
}
```

The call **replaces** the participant's associated profile list with the one supplied, so send the full set of
ids the participant should serve. Every id is validated against the registered profiles — an unknown id is
rejected with `400 Bad Request` — and a successful call returns `204 No Content`.

`GET` on the same path returns the currently associated profiles as full `DataspaceProfile` objects:

```json
[
  {
    "@context": [
      "https://w3id.org/edc/connector/management/v2"
    ],
    "@type": "DataspaceProfile",
    "name": "aurora-2025",
    "protocol": {
      "version": "2025-1",
      "path": "/aurora-2025",
      "binding": "HTTPS",
      "namespace": "https://w3id.org/dspace/2025/1/"
    },
    "jsonLdContextsUrl": [
      "https://w3id.org/dspace/2025/1/context.jsonld",
      "https://w3id.org/edc/dspace/v0.0.1",
      "https://w3id.org/aurora/2025/policy/context.jsonld",
      "https://w3id.org/aurora/2025/policy/odrl.jsonld"
    ]
  }
]
```

### Enabling all profiles

Test and sample runtimes can skip the association step entirely by setting the runtime-wide flag:

```properties
edc.dataspace.enable.profiles.all=true
```

When enabled, every participant sees every registered profile and the per-participant association is ignored.
Production deployments **should not** enable this — it defeats the isolation between dataspaces.

## Configuring DCP scopes

When the connector performs the Decentralized Claims Protocol (DCP) handshake, it asks the counterparty's
wallet for a set of credentials expressed as **scopes**. Scopes are declared per profile, so the connector only
requests the credentials a given dataspace needs.

Two categories exist:

- `DEFAULT` — requested on every DCP handshake under the profile.
- `POLICY` — requested only when a constraint whose left operand matches the scope's prefix mapping appears in
  the policy being evaluated.

### With the Management API

Scopes are managed under `/v5beta/dcpscopes` (`POST` to create, `PUT /{id}` to update, `DELETE /{id}` to
remove, `POST /request` to query). All operations require the `management-api:admin` scope.

An always-on membership scope ([dcpscope.membership.json](./dcpscope.membership.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "DcpScope",
  "@id": "membership-scope",
  "value": "org.eclipse.dspace.dcp.vc.type:MembershipCredential:read",
  "type": "DEFAULT",
  "profile": "aurora-2025"
}
```

The `DcpScope` fields are:

| Field           | Required            | Description                                                                                     |
|-----------------|---------------------|-------------------------------------------------------------------------------------------------|
| `@id`           | no                  | Identifier for the scope entry.                                                                 |
| `value`         | yes                 | The scope string sent on the DCP handshake, e.g. `org.eclipse.dspace.dcp.vc.type:MembershipCredential:read`. |
| `profile`       | no (default `*`)    | The profile this scope belongs to. Keep it set so scopes are not requested against other dataspaces. |
| `type`          | no (default `DEFAULT`) | `DEFAULT` or `POLICY`.                                                                        |
| `prefixMapping` | when `type=POLICY`  | Maps a policy left-operand prefix to the scope; required for `POLICY` scopes and must be absent for `DEFAULT` scopes. |

### With configuration

The same scopes can be seeded from configuration under `edc.iam.dcp.scopes.<alias>.*`:

```properties
edc.iam.dcp.scopes.membership.id=membership-scope
edc.iam.dcp.scopes.membership.type=DEFAULT
edc.iam.dcp.scopes.membership.value=org.eclipse.dspace.dcp.vc.type:MembershipCredential:read
edc.iam.dcp.scopes.membership.profile=aurora-2025

edc.iam.dcp.scopes.processor.id=processor-scope
edc.iam.dcp.scopes.processor.type=DEFAULT
edc.iam.dcp.scopes.processor.value=org.eclipse.dspace.dcp.vc.type:DataProcessorCredential:read
edc.iam.dcp.scopes.processor.profile=aurora-2025
```

For a `POLICY` scope, add `edc.iam.dcp.scopes.<alias>.prefix.mapping` with the left-operand prefix that
triggers the request.

## Caching JSON-LD contexts

The `jsonLdContextsUrl` declared on the profile point at the dataspace's policy vocabulary. EDC does **not**
fetch external JSON-LD contexts at runtime by default, so the JSON-LD processor must be able to resolve those
URLs locally. There are two ways to make them available.

### With the Management API

The document cache API stores a document against a URL so the processor resolves it locally instead of
reaching out to the network. Documents are managed under `/v5beta/cacheddocuments` (`POST` to create,
`GET`/`PUT`/`DELETE /{id}` to read, update, and remove, and `POST /{id}/refresh` to force a re-fetch). All
operations require the `management-api:admin` scope.

Cache a context by URL — EDC fetches and stores it ([cacheddocument.context.json](./cacheddocument.context.json)):

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CachedDocument",
  "url": "https://w3id.org/aurora/2025/policy/context.jsonld",
  "documentType": "JSON_LD"
}
```

The `CachedDocument` fields are:

| Field          | Required        | Description                                                                                           |
|----------------|-----------------|-------------------------------------------------------------------------------------------------------|
| `url`          | yes             | The document URL, as referenced from the profile or policy.                                           |
| `content`      | no              | The document inlined as raw JSON. Supply it to cache an air-gapped document without any network fetch. |
| `documentType` | no (default `JSON_LD`) | `JSON_LD` or `JSON_SCHEMA`.                                                                     |
| `pullStrategy` | no              | `NEVER`, `IF_NOT_PRESENT`, or `ALWAYS`. Defaults to `NEVER` when `content` is supplied, otherwise `IF_NOT_PRESENT`. |

To cache a document without any network access, provide its body inline via `content`:

```json
{
  "@context": [
    "https://w3id.org/edc/connector/management/v2"
  ],
  "@type": "CachedDocument",
  "url": "https://w3id.org/aurora/2025/policy/odrl.jsonld",
  "documentType": "JSON_LD",
  "content": {
    "@context": {
      "@version": 1.1,
      "@protected": true,
      "aurora": "https://w3id.org/aurora/2025/policy/"
    }
  }
}
```

### With mounted files

Alternatively, contexts can be cached at boot from files mounted into the runtime, under
`edc.jsonld.document.<alias>.*`:

```properties
edc.jsonld.document.aurora-policy.url=https://w3id.org/aurora/2025/policy/context.jsonld
edc.jsonld.document.aurora-policy.path=/app/jsonld/aurora-policy-context.jsonld
edc.jsonld.document.aurora-odrl.url=https://w3id.org/aurora/2025/policy/odrl.jsonld
edc.jsonld.document.aurora-odrl.path=/app/jsonld/aurora-odrl.jsonld
```

where `/app/jsonld` is a directory containing the context files. The runtime resolves the URLs from the mounted
files and does not fetch them at runtime.

## Validating profile policies with JSON Schema

Optionally, policies submitted for a profile can be validated against a JSON Schema at the Management API
boundary, so malformed policies are rejected on ingest. Validators are declared through the
`management-api-schema-validator` extension under `edc.mgmt.api.schema.<alias>.*` and can be scoped to a
profile: the validator activates only when the submitted input's `policy.profile` matches one of the configured
profiles.

```properties
# Group declaration: register the validators under the 'v4' version prefix
edc.mgmt.api.schema.aurora.version=v4
# Redirect the upstream schema prefix to a locally bundled copy so it is not fetched at runtime
edc.mgmt.api.schema.aurora.mapping.from=https://w3id.org/aurora/2025/policy/schema
edc.mgmt.api.schema.aurora.mapping.to=classpath:/aurora/schema
# Validate PolicyDefinition inputs, but only when policy.profile == aurora-2025
edc.mgmt.api.schema.aurora.validator.policy.type=PolicyDefinition
edc.mgmt.api.schema.aurora.validator.policy.schema=https://w3id.org/aurora/2025/policy/schema/policy-schema.json#/definitions/PolicyDefinition
edc.mgmt.api.schema.aurora.validator.policy.profiles=aurora-2025
```

Because the validator is bound to `aurora-2025`, a submitted `PolicyDefinition` is validated only when its
`policy` object carries `profile: aurora-2025`. Bundle the schema files with the connector (or mount them and
map `mapping.to` to the mount path) so validation never depends on an upstream URL being reachable.

## Putting it together

To bring a participant online in the Aurora dataspace:

1. **Register the profile** — `POST /v5beta/dataspaceprofiles` with
   [dataspaceprofile.aurora.json](./dataspaceprofile.aurora.json).
2. **Cache its JSON-LD contexts** — `POST /v5beta/cacheddocuments` for
   `https://w3id.org/aurora/2025/policy/context.jsonld` and `.../odrl.jsonld`
   (see [cacheddocument.context.json](./cacheddocument.context.json)), so the profile's contexts resolve
   locally.
3. **Declare the DCP scopes** — `POST /v5beta/dcpscopes` for the credentials Aurora requires
   (see [dcpscope.membership.json](./dcpscope.membership.json)), each with `profile: aurora-2025`.
4. **Associate the profile with the participant** — `PUT /v5beta/participants/{participantContextId}/profiles`
   with [associateprofile.aurora.json](./associateprofile.aurora.json).

The participant now serves the Aurora DSP endpoints — for example the catalog can be requested at
`POST /{participantContextId}/aurora-2025/catalog/request` — requesting the Aurora credentials on the DCP
handshake and resolving the Aurora policy contexts from the cache.

## Related

- [CEL Policy Expressions](../policy-engine/cel/_index.md) — evaluate a dataspace's policy operands declaratively.
- [Identity Hub](../../identity-hub/_index.md) — how DCP scopes translate into credential presentations.
- [Management API](../_index.md#management-api) — the API surface these calls belong to.
