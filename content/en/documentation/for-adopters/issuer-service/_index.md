---
title: Issuer Service
description: >
  Details how EDC implements decentralized identity, access control, and trust using standards such as [Decentralized Identifiers](https://www.w3.org/TR/did-core/)and [W3c Verifiable Credentials](https://www.w3.org/TR/vc-data-model/).
weight: 50
---

The IssuerService (IS) is a component of the Eclipse Dataspace Connector (EDC) that is responsible for issuing
verifiable credentials to entities within a data ecosystem using the [Decentralized Claims Protocol
(DCP)](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol).

Furthermore, the IssuerService shares a lot of its properties with
[IdentityHub](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol) so all the introductory comments
there hold true here as well.

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

Credential requests may take some time to process, and there could even be manual approval steps involved, so the
issuance process is asynchronous in nature. Once the credentials are ready, the IssuerService sends them to the holder's
Storage API.

While the IssuerService does keep track of all credentials it has ever issued, it never stores the actual signed
credentials, only the unsigned credential data (the claims) and some metadata about the issuance process.

Issuers may also inform the holder that a new or updated credential is ready for pickup by sending a Credential Offer
message. For example, issuers may rotate their signing keys, hence requiring holders to obtain new credentials.

## Configuring the IssuerService

Verifiable Credentials are just JSON documents that follow a certain basic schema. However, that schema does not define
the shape of the `credentialSubject` claim.
So how does the IssuerService know what data to put into the `credentialSubject` of the Verifiable Credential it issues?

First, the IssuserService requires a `CredentialDefinition` object that describes the shape of the credential by mapping
input variables onto output variables:

```json
{
  "attestations": ["db-attestation-def-1"],
  "credentialType": "MembershipCredential",
  "id": "demo-credential-def-2",
  "jsonSchema": "{}",
  "jsonSchemaUrl": "https://example.com/schema/demo-credential.json",
  "mappings": [
    {
      "input": "membership_type",
      "output": "credentialSubject.membershipType",
      "required": "true"
    },
    {
      "input": "membership_start_date",
      "output": "credentialSubject.membershipStartDate",
      "required": true
    }
  ],
  "rules": [],
  "format": "VC1_0_JWT"
}
```

The claims (e.g. `membership_type`) are mapped onto output fields in the Verifiable Credential (e.g.
`credentialSubject.membershipType`).

For detailed information about configuring the credential claims mapping, please refer to [this
document](https://github.com/eclipse-edc/IdentityHub/blob/main/docs/developer/architecture/issuer/issuance/issuance.process.md#).

### Preconfigured vs. Anonymous credential requests

Some dataspaces may require that the prospective holders of Verifiable Credentials be known to the IssuerService in
advance. One example of this is when holders must undergo some kind of onboarding or vetting process before being
allowed to participate in the dataspace. In such cases, there usually are third-party applications, such as onboarding
portals, where holders upload their identification documents, legal paperwork etc., and once the vetting process is
complete, a `Holder` entity is created in the IssuerService's internal database (cf. [Administration
API](#administration-api)).

This enables the IssuerService to link additional data to the holder, which may ultimately end up in the
`credentialSubject` of the Verifiable Credential. Furthermore, the IssuerService can enforce that only known holders are
allowed to request credentials.

There may, however, be use cases where is is _not_ necessary, or even desirable, to pre-register holders in the
IssuerService. In such cases, the IssuerService can be configured to allow anonymous credential requests, i.e., holders
can simply make a CredentialRequest without being pre-registered in the IssuerService.

To enable that, the configuration value `edc.issuance.anonymous.allowed` must be set to `true`. By default, anonymous
credential requests are disabled.
An "anonymous" credential request is one, where the holder is generated on-the-fly based on the DID provided in the
self-issued ID token attached to the CredentialRequest. To track that, the `anonymous` flag is set on the created Holder
entity:

```json
{
  "id": "holder-123",
  "did": "did:example:holder123",
  "anonymous": true,
  "name": null
}
```

In systems where both pre-registered and anonymous holders are allowed, all AttestationSource implementations must be able to deal
with both types of holders and should therefor inspect the `anonymous` flag on the Holder entity.

## Generating Verifiable Credentials

When a CredentialRequest is received, the IssuerService performs the following steps to generate a Verifiable
Credential:

- validate the holder's self-issued ID token: check signature, expiration, audience, etc.
- look up the `Holder` entity, create on-the-fly or reject request if anonymous requests are not allowed
- look up the `CredentialDefinition` referenced in the `CredentialRequest`
- construct and execute each `AttestationSource` defined in the `CredentialDefinition` to gather claims data for the
  `credentialSubject`
- evaluate all rules attached to the `CredentialDefinition`
- return a successful HTTP message to acknowledge receipt of the CredentialRequest

At this point, the credential request is converted into a so-called `IssuanceProcess`, but no credential has been
generated nor signed yet. That happens in an _asynchronous_ process in the IssuerService:

- generate Verifiable Credential JSON document based on claim mappings
- sign the Verifiable Credential using the Issuer's private key. By default, only JWT credentials are supported, but
  this can be extended by implementing a custom `CredentialGenerator` component.
- record this new Verifiable Credential in the status list credential (check [Credential
  Revocation](#credential-revocation) for more information).
- deliver the signed Verifiable Credential to the holder's [Storage API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#storage-api).

## Credential revocation

Each verifiable credential _may_ contain a `credentialStatus` field that references a so-called status list credential.
In most cases this is just another Verifiable Credential that contains an encoded bitstring with information about
revoked or suspended credentials. If a credential is marked as _revoked_ or _suspended_ in the status list credential,
verifiers should reject that credential.

When new credentials are issued, the IssuerService adds them to its status list and stores the corresponding index in
that status list in the `credentialStatus` field of the issued credential.

The IssuerService supports both `BitStringStatusList` and `StatusList2021` credential status types, but the
`BitStringStatusList` is used by default as it is the newer specification.

Please find detailed information about credential revocation in [this document](https://github.com/eclipse-edc/IdentityHub/blob/main/docs/developer/architecture/issuer/credential-revocation/credential-revocation.md#).

## Extensibility of the IssuerService

Like all other EDC components, the IssuerService is highly extensible and customizable by leveraging EDC's [extension
system](https://eclipse-edc.github.io/documentation/for-adopters/extensions/).

The following feature areas are intended to be extensible:

### Credential generators

Credential generators are responsible for creating and signing Verifiable Credentials in a specific format. By default,
the IssuerService comes with a JWT credential generator that creates JWT-based Verifiable Credentials. However, other
formats such as Linked Data Proofs, SD-JWT or even COSE can be implemented by creating a custom `CredentialGenerator`
extension.

### Status list credential types

At the time of writing, two types of status list credentials are defined: `StatusList2021` and `BitStringStatusList`.
The IssuerService implements full support for the latter, because `StatusList2021` is outdated and not recommended for
use anymore.

However, support for `StatusList2021` (or a custom status list credential type) can be added by implementing a
`StatusListManager` and contributing it to the DI container.

### Persistence stores

The IssuerService persists its data using EDC's standard persistence abstraction layer, and it ships with support for
PostgreSQL as well as an in-memory database for testing and demo purposes.

Adopters can implement custom persistence stores by implementing the relevant `*Store` interfaces and contributing them
to the DI container.

### Attestation sources and factories

The IssuerService provides support for the following `AttestationSource` implementations out of the box:

- `DatabaseAttestationSource`: fetches all columns from an SQL database that are linked to the holder's ID. The mapping
  structure in the `CredentialDefinition` defines which columns map to which output fields in the Verifiable Credential.
- `PresentationAttestationSource`: takes a Verifiable Presentation provided by the holder in the
  `CredentialRequest` and extracts claims from the contained Verifiable Credentials to populate the new credential's
  `credentialSubject`. _This is still under development_.

## IssuerService APIs

### Issuance API

Since the IssuerService implements the Decentralized Claims Protocol, it exposes several REST endpoints as defined in
the DCP specification:

- [Credential Request
  API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#credential-request-api): used by
  holders to initiate the credential issuance process.
- [Issuer Metadata API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#issuer-metadata-api): exposes
  metadata about the IssuerService, such as supported credential types and formats.
- [Credential Request Status
  API](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/#credential-request-status-api): used
  by holders to query the status of their credential requests.

Like the IdentityHub, the IssuerService supports multiple participant contexts (tenants) and each API request is
prefixed with the base64-encoded participant context ID, for example:
`v1alpha/participants/{base64(participantContextId)}/credentials`.

### Administration API

The IssuerService exposes an Administration API that allows operators to manage credential definitions, holders,
issuance processes, etc.:

- Attestation API: allows to add, query and delete `AttestationDefinition` objects
- Credentials API: allows to revoke/suspend/resume Credentials, query credentials and also to trigger a credential offer
  to a specific holder
- Holder API: allows management of `Holder` entities, including querying, adding, updating and deleting
- CredentialDefinition API: allows management of `CredentialDefinition` objects
- IssuanceProcess API: allows querying of `IssuanceProcess` objects to track the status of credential requests

Again, all endpoints are bound to a specific participant context and must be prefixed with the base64-encoded
participant context ID.

Please check out the full [OpenAPI specification of the IssuerService Administration API](https://eclipse-edc.github.io/IdentityHub/openapi/issuer-admin-api/).

## Deployment Options

As all other EDC components, the IssuerService is comprised of a set of Java modules that can be packaged and deployed
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
