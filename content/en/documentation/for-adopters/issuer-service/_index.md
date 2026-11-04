---
title: Issuer Service
description: >
  Details how the EDC IssuerService issues, delivers and revokes Verifiable Credentials with the Decentralized Claims Protocol.
weight: 55
---

The IssuerService (IS) is a component of the Eclipse Dataspace Components (EDC) that is responsible for issuing
verifiable credentials to entities within a data ecosystem using the [Decentralized Claims Protocol
(DCP)](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol).

Furthermore, the IssuerService shares a lot of its properties with the [Identity Hub](../identity-hub/_index.md) (it is
built from the same repository, manages participant contexts, key pairs and DID documents the same way, and embeds the
same STS), so all the introductory comments there hold true here as well.

Prospective holders of Verifiable Credentials can request credentials from the IssuerService by making a
_CredentialRequest_ via its Issuance API, and the IssuerService will asynchronously process the request and send the
Verifiable Credential to the holder's Storage API.

## Basic Concepts

Holders operate a DCP-compliant Storage API and can receive Verifiable Credentials. In practice, holders host a DID
document that contains a `CredentialService` endpoint entry, so that the IssuerService can resolve the holder's Storage
API endpoint:

```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:example:holder123",
  "service": [
    {
      "id": "did:example:holder123#credential-storage",
      "type": "CredentialService",
      "serviceEndpoint": "https://holder.example.com/credentials"
    }
  ]
}
```

When requesting credentials, holders attach their DID to the CredentialRequest, so that the IssuerService can look up
the holder's Storage API endpoint and send the freshly minted Verifiable Credential there. Issuers may require
out-of-band information about the requester, such as government credentials or some other third party approval. Please
refer to the [Configuring the IssuerService](#configuring-the-issuerservice) section for more information about this.

Credential requests may take some time to process, so the issuance process is asynchronous in nature. Once the
credentials are ready, the IssuerService sends them to the holder's Storage API.

While the IssuerService does keep track of all credentials it has ever issued, it never stores the actual signed
credentials, only the unsigned credential data (the claims) and some metadata about the issuance process.

Issuers may also inform the holder that a new or updated credential is ready for pickup by sending a Credential Offer
message. For example, issuers may rotate their signing keys, hence requiring holders to obtain new credentials.

## Configuring the IssuerService

### DCP profile

The DCP profile of the IssuerService, `edc.issuer.dcp.profile`, determines the format of the credentials it issues and
the type of their status lists:

| Profile | Credential format | Status list |
|---|---|---|
| `vc20-bssl/jwt` (default) | `VC2_0_JOSE`: W3C VCDM 2.0, secured with JOSE | `BitstringStatusList` |
| `vc11-sl2021/jwt` | `VC1_0_JWT`: W3C VCDM 1.1 as JWT | `StatusList2021` |

The format of every credential definition created through the Administration API is the profile's format. The runtime
doesn't start with an unknown profile.

### Credential definitions

Verifiable Credentials are just JSON documents that follow a certain basic schema. However, that schema does not define
the shape of the `credentialSubject` claim.
So how does the IssuerService know what data to put into the `credentialSubject` of the Verifiable Credential it issues?

First, the IssuerService requires a `CredentialDefinition` object that describes the shape of the credential by mapping
input variables onto output variables:

```json
{
  "id": "demo-credential-def-2",
  "credentialType": "MembershipCredential",
  "jsonSchemaUrl": "https://example.com/schema/demo-credential.json",
  "validity": 31536000,
  "attestations": ["db-attestation-def-1"],
  "mappings": [
    {
      "input": "membership_type",
      "output": "credentialSubject.membershipType",
      "required": true
    },
    {
      "input": "membership_start_date",
      "output": "credentialSubject.membershipStartDate",
      "required": true
    }
  ],
  "rules": [
    {
      "type": "expression",
      "configuration": { "claim": "membership_type", "operator": "eq", "value": "full" }
    }
  ],
  "additionalContext": [],
  "privateProperties": {}
}
```

- `credentialType`: the type of the issued credential.
- `jsonSchema` or `jsonSchemaUrl`: the schema of the credential (at least one of them).
- `validity`: how long issued credentials are valid, in seconds.
- `attestations`: the ids of the attestation definitions that provide the claims (see below).
- `mappings`: the claims (e.g. `membership_type`) mapped onto output fields in the Verifiable Credential (e.g.
  `credentialSubject.membershipType`). Mappings can't write the properties the IssuerService sets itself: `@context`,
  `id`, `type`, `issuer`, `issuanceDate`, `validFrom`, `expirationDate`, `validUntil`, `credentialStatus` and `proof`.
- `rules`: conditions the claims must meet for the credential to be issued. The `expression` rule compares a `claim`
  (dot path) with a `value` using `eq`, `neq`, or, for numbers, `gt`, `geq`, `lt`, `leq`.
- `additionalContext`: JSON-LD contexts added to the issued credentials.
- `privateProperties`: properties for the operator's use, never put in the credentials.

For detailed information about configuring the credential claims mapping, please refer to [this
document](https://github.com/eclipse-edc/IdentityHub/blob/main/docs/developer/architecture/issuer/issuance/issuance.process.md#).

### Attestations

An attestation definition (`id`, `attestationType`, `configuration`) tells the IssuerService where the claims come
from. Two attestation types are shipped:

- `holder`: the `properties` of the [`Holder`](#preconfigured-vs-anonymous-credential-requests) entity, no configuration.
- `database` (in `issuerservice-feature-sql-bom`): the columns of the row of a database table whose id column matches the
  holder's id. Configuration: `dataSourceName` (a registered datasource), `tableName`, `idColumn` (default `holder_id`)
  and `required` (default `false`: a missing row yields no claims instead of an error). The datasource and the table are
  checked when the definition is created.

### Preconfigured vs. Anonymous credential requests

Some dataspaces may require that the prospective holders of Verifiable Credentials be known to the IssuerService in
advance. One example of this is when holders must undergo some kind of onboarding or vetting process before being
allowed to participate in the dataspace. In such cases, there usually are third-party applications, such as onboarding
portals, where holders upload their identification documents, legal paperwork etc., and once the vetting process is
complete, a `Holder` entity (`holderId`, `did`, `name`, `properties`) is created in the IssuerService's internal database
(cf. [Administration API](#administration-api)).

This enables the IssuerService to link additional data to the holder, which may ultimately end up in the
`credentialSubject` of the Verifiable Credential. Furthermore, the IssuerService can enforce that only known holders are
allowed to request credentials.

There may, however, be use cases where it is _not_ necessary, or even desirable, to pre-register holders in the
IssuerService. In such cases, the IssuerService can be configured to allow anonymous credential requests, i.e., holders
can simply make a CredentialRequest without being pre-registered in the IssuerService.

To enable that, the configuration value `edc.issuance.anonymous.allowed` must be set to `true`. By default, anonymous
credential requests are disabled.
An "anonymous" credential request is one, where the holder is generated on-the-fly based on the DID provided in the
self-issued ID token attached to the CredentialRequest, once the token is verified. To track that, the `anonymous` flag
is set on the created Holder entity:

```json
{
  "holderId": "holder-123",
  "did": "did:example:holder123",
  "anonymous": true,
  "name": null
}
```

In systems where both pre-registered and anonymous holders are allowed, all AttestationSource implementations must be able to deal
with both types of holders and should therefore inspect the `anonymous` flag on the Holder entity.

## Generating Verifiable Credentials

When a CredentialRequest is received, the IssuerService performs the following steps to generate a Verifiable
Credential:

- validate the holder's self-issued ID token: check signature, expiration, audience, etc.
- look up the `Holder` entity, create on-the-fly or reject request if anonymous requests are not allowed
- look up the `CredentialDefinition` referenced in the `CredentialRequest`
- construct and execute each `AttestationSource` defined in the `CredentialDefinition` to gather claims data for the
  `credentialSubject`
- evaluate all rules attached to the `CredentialDefinition`
- return a successful HTTP message to acknowledge receipt of the CredentialRequest, with the id of the issuance process.
  A repeated request (same holder request id) is answered with `409` and the existing issuance process.

At this point, the credential request is converted into a so-called `IssuanceProcess`, in the state `APPROVED`, but no
credential has been generated nor signed yet. That happens in an _asynchronous_ process in the IssuerService:

- `APPROVED`: generate the Verifiable Credential JSON document based on claim mappings, record it, and record it in the
  status list credential (check [Credential Revocation](#credential-revocation) for more information);
- `DELIVERING`: sign the Verifiable Credential using the Issuer's private key and deliver it to the holder's
  [Storage API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#storage-api). Failed deliveries
  are retried with the same credentials;
- `DELIVERED`: the holder received the credentials;
- `REJECTING`, then `ERRORED`: the issuance failed for good; the holder is notified that its request was rejected.

The holder can follow its request through the Credential Request Status API, which reports `RECEIVED`, `ISSUED` or
`REJECTED`. The issuance state machine and its retries are configured with the `edc.issuer.issuance.state-machine.*` and
`edc.issuer.issuance.send.*` settings (by default up to 80 attempts over about 6 hours).

## Credential revocation

Each verifiable credential _may_ contain a `credentialStatus` field that references a so-called status list credential.
In most cases this is just another Verifiable Credential that contains an encoded bitstring with information about
revoked or suspended credentials. If a credential is marked as _revoked_ or _suspended_ in the status list credential,
verifiers should reject that credential.

When new credentials are issued, the IssuerService adds them to its status list and stores the corresponding index in
that status list in the `credentialStatus` field of the issued credential. The status list type follows the
[DCP profile](#dcp-profile).

| Setting | Default | Description |
|---|---|---|
| `edc.issuer.statuslist.bitstring.size` | `131072` | number of entries of a status list (minimum 131072) |
| `edc.issuer.statuslist.validity` | 1 year | validity of a status list credential, in seconds |
| `edc.issuer.statuslist.renewal.period` | 1 day | how often status list credentials that are about to expire are renewed, in seconds; `0` disables it |
| `edc.issuer.statuslist.renewal.threshold` | 30 days | how long before expiry a status list credential is renewed, in seconds |

Status list credentials are published by the IssuerService itself, on the `statuslist` API context
(`web.http.statuslist.port`, default `9999`, and `web.http.statuslist.path`, default `/statuslist`), at the public URL
`edc.statuslist.callback.address`. Verifiers fetch them from there, so it must be publicly reachable over HTTPS.

Credentials are revoked with the Administration API (`POST …/credentials/{credentialId}/revoke`); their status can be read
with `GET …/credentials/{credentialId}/status`. Suspension and resumption are not implemented yet (`501`).

Please find detailed information about credential revocation in [this document](https://github.com/eclipse-edc/IdentityHub/blob/main/docs/developer/architecture/issuer/credential-revocation/credential-revocation.md#).

## Extensibility of the IssuerService

Like all other EDC components, the IssuerService is highly extensible and customizable by leveraging EDC's [extension
system](../extensions/_index.md).

The following feature areas are intended to be extensible:

### Credential generators

Credential generators are responsible for creating and signing Verifiable Credentials in a specific format. The
IssuerService comes with generators for `VC1_0_JWT` and `VC2_0_JOSE` credentials. Other formats such as Linked Data
Proofs, SD-JWT or even COSE can be implemented by creating a custom `CredentialGenerator` extension.

### Status list credential types

`BitstringStatusList` and `StatusList2021` status lists are supported, selected by the [DCP profile](#dcp-profile).
Custom status list credential types can be added by implementing a `StatusListManager` and contributing it to the DI
container.

### Persistence stores

The IssuerService persists its data using EDC's standard persistence abstraction layer, and it ships with support for
PostgreSQL (`issuerservice-feature-sql-bom`) as well as an in-memory database for testing and demo purposes.

Adopters can implement custom persistence stores by implementing the relevant `*Store` interfaces and contributing them
to the DI container.

### Attestation sources and factories

Additional attestation types can be added by implementing an `AttestationSourceFactory` and an `AttestationSource`, and
registering them for a new `attestationType`.

## IssuerService APIs

### Issuance API

Since the IssuerService implements the Decentralized Claims Protocol, it exposes several REST endpoints as defined in
the DCP specification, on the `issuance` API context (`web.http.issuance.port`, default `13132`, and
`web.http.issuance.path`, default `/api/issuance`):

- [Credential Request
  API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#credential-request-api): used by
  holders to initiate the credential issuance process, `POST /v1/participants/{participantContextId}/credentials`.
- [Issuer Metadata API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#issuer-metadata-api): exposes
  metadata about the IssuerService, such as supported credential types and formats,
  `GET /v1/participants/{participantContextId}/metadata`.
- [Credential Request Status
  API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#credential-request-status-api): used
  by holders to query the status of their credential requests, `GET /v1/participants/{participantContextId}/requests/{requestId}`.

Like the IdentityHub, the IssuerService supports multiple participant contexts (tenants), and each API request is
prefixed with the participant context ID. These endpoints are called by holders and must be reachable by them; their
request bodies are limited to `web.http.issuance.maxbodysize` (5 MiB).

### Administration API

The IssuerService exposes an Administration API (version `v1`, on the `issueradmin` API context:
`web.http.issueradmin.port`, default `15152`, and `web.http.issueradmin.path`, default `/api/issuer`) that allows
operators to manage credential definitions, holders, issuance processes, etc. All endpoints are bound to a participant
context, under `/v1/participants/{participantContextId}`:

| Resource | Endpoints | Scopes |
|---|---|---|
| Attestation definitions | `POST …/attestations`, `DELETE …/attestations/{id}`, `POST …/attestations/query` | `issuer-admin-api:attestations:read`, `:write` |
| Credential definitions | `POST`, `PUT …/credentialdefinitions`, `GET`, `DELETE …/credentialdefinitions/{id}`, `POST …/credentialdefinitions/query` | `issuer-admin-api:credentialdefinitions:read`, `:write` |
| Credentials | `POST …/credentials/query`, `POST …/credentials/{id}/revoke`, `GET …/credentials/{id}/status`, `POST …/credentials/offer` (send a credential offer to a holder) | `issuer-admin-api:credentials:read`, `:write` |
| Holders | `POST`, `PUT …/holders`, `GET`, `DELETE …/holders/{id}`, `POST …/holders/query` | `issuer-admin-api:holders:read`, `:write` |
| Issuance processes | `GET …/issuanceprocesses/{id}`, `POST …/issuanceprocesses/query` | `issuer-admin-api:issuanceprocesses:read` |

The Administration API is secured like the Identity API of the Identity Hub: with participant API keys
(`issuerservice-bom`) or OAuth2 tokens (`issuerservice-oauth2-bom`), and the scopes above (`issuer-admin-api:read`,
`issuer-admin-api:write` for all resources, `issuer-admin-api:admin` across participant contexts). See
[Authentication and authorization](../identity-hub/_index.md#authentication-and-authorization). The issuer's participant
contexts, key pairs and DID documents are managed through the Identity API, which the IssuerService includes.

Please check out the full [OpenAPI specification of the IssuerService Administration API](https://eclipse-edc.github.io/IdentityHub/openapi/issuer-admin-api/).

## Deployment Options

As all other EDC components, the IssuerService is composed of a set of Java modules that can be packaged and deployed
in various ways.

The clear recommendation is to deploy the IssuerService as a standalone runtime with its own HSM (vault) and its own
database. The reasons for this are mostly security-related: private keys to sign credentials are extremely sensitive and must be
protected accordingly.
In a similar vein, the IssuerService database contains sensitive information about holders and issued credentials, so it
should not be shared with other components.

It is strongly recommended to deploy the IssuerService in a specially protected environment with strict access controls
and potentially even network isolation from other components.

We also recommend using an individual participant context ID for the IssuerService.

That said, there certainly are situations where this might not be practical or feasible, for example in development or
testing environments or when every credential holder is also a credential issuer.
While we still recommend separating the runtimes, it is possible to co-locate the IssuerService and the IdentityHub (or
even other components) in a single Java process with the same participant context ID being used in both components.

The following table summarizes the different deployment options:

| Runtimes   | Participant Context IDs | Database + HSM/Vault | Supported |
| ---------- | ----------------------- | -------------------- | --------- |
| Co-located | Same                    | Shared               | &#9989;   |
| Co-located | Different               | both                 | &#9989;   |
| Separate   | Same                    | Separate             | &#9989;   |
| Separate   | Different               | both                 | &#9989;   |
| Separate   | Same                    | Different            | &#9888;\* |

In all cases where the participant context ID is the same for both the holder and the issuer, the `ParticipantContext`
object must only be **created once**.

\*) When the IssuerService and the IdentityHub are deployed as separate runtimes, but the same participant context ID is
used for the holder and the issuer, then a custom `DidPublisher` must be implemented and configured in both
runtimes. This is necessary to ensure that DID documents created by either runtime are not overwritten by the other.
