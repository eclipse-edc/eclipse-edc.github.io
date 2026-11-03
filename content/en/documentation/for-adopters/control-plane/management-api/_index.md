---
title: Management API
description: Versions of the Management API, how clients authenticate, and the scopes that authorize them.
weight: 7
---

<!-- TOC -->
  * [Overview](#overview)
  * [Versions](#versions)
  * [Authentication](#authentication)
    * [API key (v4)](#api-key-v4)
    * [OAuth2 tokens (v5)](#oauth2-tokens-v5)
  * [Authorization with scopes](#authorization-with-scopes)
    * [Scope format](#scope-format)
    * [Scopes of the endpoints](#scopes-of-the-endpoints)
    * [Admin scope and resource ownership](#admin-scope-and-resource-ownership)
  * [Request validation](#request-validation)
  * [Related](#related)
<!-- TOC -->

## Overview

The Management API is the RESTful interface through which applications drive the control plane: they create assets,
policies and contract definitions, request catalogs, negotiate contracts and start transfers. It is served on its own
API context (`web.http.management.port`, default `8181`, and `web.http.management.path`, default `/api/management`).
Like the other internal APIs, it must not be exposed to the internet.

Request and response bodies are JSON-LD, with the context `https://w3id.org/edc/connector/management/v2`.

## Versions

| Version | Status | Runtime | Paths |
|---|---|---|---|
| v3 | removed in 1.0 | | |
| v4 | stable | single participant | `/v4/assets`, `/v4/policydefinitions`, `/v4/contractnegotiations`, ... |
| v5 | stable | multi-participant | `/v5/participants/{participantContextId}/assets`, ... |

The v4 API serves the single participant of a "classic" runtime. The v5 API serves the participant contexts of a
multi-participant runtime (see [Participant Contexts](../participant-contexts/_index.md)): every resource path starts
with the participant context, and v5 adds the endpoints of the features that only multi-participant runtimes have:

- participant contexts and their configuration: `/v5/participants`, `/v5/participants/{participantContextId}/config`;
- [dataspace profiles](../dataspace-profiles/_index.md), DCP scopes, cached documents and schema validators:
  `/v5/dataspaceprofiles`, `/v5/participants/{participantContextId}/profiles`, `/v5/dcpscopes`, `/v5/cacheddocuments`,
  `/v5/schemavalidators`;
- [CEL expressions](../policy-engine/cel/_index.md): `/v5/celexpressions`;
- [partners and partner groups](../policy-engine/partners/_index.md): `/v5/participants/{participantContextId}/partners`,
  `…/partnergroups`;
- discovery of the dataspace profiles usable with a counter-party (from its DID document and DSP version metadata):
  `/v5/participants/{participantContextId}/discover`.

`/v4/secrets` and `/v4/catalogs` (the federated catalog) exist only in v4.

The versions a runtime serves are listed by `GET /v1/version` on the default API context (`web.http.path`), with their
version number, path and maturity.

## Authentication

### API key (v4)

A single participant runtime authenticates Management API calls with an API key, sent in the `X-Api-Key` header:

```properties
web.http.management.auth.type=tokenbased
web.http.management.auth.key.alias=management-api-key
```

`web.http.management.auth.key.alias` names the vault secret that holds the key; `web.http.management.auth.key` sets it
in the configuration instead, which is only acceptable for tests. With `web.http.management.auth.type=delegated`, the
calls are authenticated with tokens of a third-party identity provider instead, validated against the keys at
`web.http.management.auth.dac.key.url` (and the audience `web.http.management.auth.audience`, if set).

### OAuth2 tokens (v5)

A multi-participant runtime authenticates Management API calls with OAuth2 bearer tokens (JWTs) issued by an
authorization server, e.g. Keycloak, and validates them against the server's keys:

| Setting | Description |
|---|---|
| `edc.iam.oauth2.jwks.url` | URL of the JWKS of the authorization server (required) |
| `edc.iam.oauth2.issuer` | expected `iss` claim |
| `edc.iam.oauth2.jwks.cache.validity` | how long the JWKS is cached, in ms (default 5 minutes) |

The token's `exp` and `nbf` claims are checked, and two claims identify the caller:

- `sub`: the participant context the caller acts for. It must be an existing participant context that is not
  `DEACTIVATED`, unless the token has the admin scope;
- `scope`: the space-separated scopes granted to the caller.

A request without a valid token is answered with `401`.

## Authorization with scopes

### Scope format

Scopes have the form `management-api[:resource]:action`, where `action` is `read`, `write` or `admin`:

- a stronger action includes the weaker ones: `admin` includes `write`, `write` includes `read`. A token with
  `management-api:assets:write` may call the endpoints that require `management-api:assets:read`;
- without a resource, a scope applies to all resources: `management-api:read` (the same as `management-api:*:read`)
  allows every read endpoint.

### Scopes of the endpoints

| Scope | Endpoints |
|---|---|
| `management-api:assets:read`, `:write` | assets |
| `management-api:policies:read`, `:write` | policy definitions |
| `management-api:contractdefinitions:read`, `:write` | contract definitions |
| `management-api:catalog:read` | catalog and dataset requests |
| `management-api:negotiations:read`, `:write` | contract negotiations, including [approval](../policy-engine/negotiation-approval/_index.md) |
| `management-api:agreements:read`, `:write` | contract agreements, including retirement |
| `management-api:transfers:read`, `:write` | transfer processes |
| `management-api:dataplanes:read`, `:write` | data planes and their [registration](../../data-plane/_index.md) |
| `management-api:partners:read`, `:write` | partners and partner groups |
| `management-api:profiles:read` | the dataspace profiles of a participant context |
| `management-api:discovery:read` | dataspace profile discovery |
| `management-api:admin` | participant contexts and their configuration, dataspace profiles, DCP scopes, CEL expressions, cached documents, schema validators |

An endpoint that doesn't declare a scope can't be called at all: the runtime logs a warning at startup and denies every
request to it. This protects custom extensions that forget to declare one.

### Admin scope and resource ownership

A token without `management-api:admin` only reaches the resources of its own participant context: the participant
context in the path must be the one in the `sub` claim, and the resource must belong to it. Otherwise the request is
rejected, or answered with `404` if the resource doesn't exist for that participant context.

`management-api:admin` lifts this restriction: an admin token acts on any participant context, and its `sub` doesn't
need to be a participant context, e.g. for the service account of a provisioning system. Grant it only to such
operator tools.

## Request validation

The Management API validates request bodies against JSON Schemas, and rejects invalid requests with `400`. The schemas
of a dataspace can be extended with schemas of its own, e.g. to require specific policy constraints, see
[Validating profile policies with JSON Schema](../dataspace-profiles/_index.md#validating-profile-policies-with-json-schema).

## Related

- [Participant Contexts](../participant-contexts/_index.md)
- [Best practices: exposing APIs](../../../for-contributors/best-practices.md#21-exposing-apis-to-the-internet)
- Decision record: [scope-based API authorization](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2026-06-06-scope-based-api-authorization)
