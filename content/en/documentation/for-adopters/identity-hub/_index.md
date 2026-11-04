---
title: Identity Hub
description: >
  Details how EDC implements decentralized identity, access control, and trust using standards such as [Decentralized Identifiers](https://www.w3.org/TR/did-core/) and [W3c Verifiable Credentials](https://www.w3.org/TR/vc-data-model/).
weight: 50
---

Identity Hub (IH) manages organization identity resources such as credentials for a dataspace participant. It is designed
for machine-to-machine interactions and does not manage personal verifiable credentials. Identity Hub implements the
[Decentralized Claims Protocol (DCP)](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol) and is
based on key decentralized identity standards, including [W3C DIDs](https://www.w3.org/TR/did-core/), the
[W3C did:web Method](https://w3c-ccg.github.io/did-method-web/), and the W3C Verifiable Credentials Data Model
[v1.1](https://www.w3.org/TR/vc-data-model/) and [v2.0](https://www.w3.org/TR/vc-data-model-2.0/) specifications, so we
recommend familiarizing yourself with those technologies first.

> One question that frequently comes up is whether Identity Hub supports [OpenID for Verifiable Credentials (OID4VC)](https://openid.net/sg/openid4vc/specifications/). The short answer is No. That's because OID4VC mandates human (end-user) interactions, while Identity Hub is designed for machine-to-machine interactions where humans are not in the loop. Identity Hub is built on many of the same decentralized identity standards as OID4VC but implements DCP, a protocol specifically designed for non-human flows.

Identity Hub securely stores and manages W3C Verifiable Credentials, including handling presentation and issuance. But Identity Hub is more than an enterprise "wallet" since it handles key material and DID documents. Identity Hub manages the following identity resources:

- **Verifiable Credentials**. Requesting, receiving, renewing and managing issued credentials and generating Verifiable Presentations (VPs).
- **Key Pairs**. Generating, rotating, and revoking signing keys.
- **DID Documents**. Generating and publishing DID documents.

It also embeds a **Secure Token Service (STS)** that issues the self-issued tokens of its participants.

> The [EDC MVD Project](https://github.com/eclipse-edc/MinimumViableDataspace) provides a full test dataspace setup with Identity Hub. It's an excellent tool to experiment with Identity Hub and decentralized identity technologies.

As we will see, Identity Hub can be deployed to diverse topologies, from embedded in a small footprint edge connector to an organization-wide clustered system. Before getting into these details, let's review the role of Identity Hub.

## Identities and Credentials in a Dataspace: The Role of Identity Hub

> Note this section assumes a solid understanding of security protocols, DIDs, verifiable credentials, and modern cryptography concepts.

Identity Hub is built on the [Decentralized Claims Protocol (DCP)](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol). This protocol overlays the [Dataspace Protocol (DSP)](https://github.com/eclipse-dataspace-protocol-base/DataspaceProtocol) by adding security and trust based on a decentralized identity model. To see how a decentralized identity system works, we will contrast it with a centralized approach.

Protocols such as traditional OAuth2 grants adopt a centralized model where a single identity provider or set of federated providers issue tokens on behalf of a party. Data consumers request a token from an _identity provider_, which, in turn, generates and signs one along with a set of claims. The data consumer passes the signed token to the data provider, which verifies the token using public key material from the identity provider:

![centralized identity](centralized-identity.svg)

The centralized model is problematic for many dataspaces:

- **It is prone to network outages.** If the identity provider goes down, the entire dataspace is rendered inoperable. Using federated providers only partially mitigates this risk while increasing complexity since large sections of a dataspace will still be subject to outage.
- **It does not preserve privacy.** Since an identity provider issues and verifies tokens, it is privy to communications between data consumers and providers. While the provider may not know the content of the communications, it is aware of who is communicating with whom.
- **Participants are not in control of their identity and credentials.** The identity provider creates identity tokens and manages credentials, not the actual dataspace participants.

Identity Hub and the _Decentralized Claims Protocol_ are designed to address these limitations by introducing a model where there is no single point of failure, privacy is maintained, and dataspace participants control their identities and credentials. This approach is termed _decentralized identity_ and builds on foundational standards from the [W3C](https://www.w3.org/) and [Decentralized Identity Foundation](https://identity.foundation/).

### The Presentation Flow

To understand the role of Identity Hub in a dataspace that uses a decentralized identity system, let's start with a basic example. A consumer wants to access data from a provider that requires proof the consumer is certified by a third-party auditor. The certification proof is a W3C Verifiable Credential issued by the auditor. For now, we'll assume the consumer's Identity Hub already manages the VC (issuance will be described later).

When the consumer's control plane makes a contract negotiation request to the provider, it must include a declaration of which participant it is associated with (the participant ID) and a way for the provider to access the required certification VC. From the provider's perspective, it needs a mechanism to verify the consumer control plane is operating on behalf of the participant and that the VC is valid. Once this is done, the provider can trust the consumer control plane and grant it access to the data by issuing a contract agreement.

Instead of obtaining a token from a third-party identity provider, DCP mandates self-issued tokens. Self-issued tokens are generated and signed by the requesting party, which in the current example is the data consumer. As we will see, these self-issued tokens identify the data consumer and include a way for the provider to resolve the consumer's credentials. This solves the issues of centralized identity systems highlighted above. By removing the central identity provider, DCP mitigates the risk of a network outage. Privacy is preserved since all communication is between the data consumer and the data provider. Finally, dataspace members remain in control of their identities and credentials.

Let's look at how this works in practice. Identity and claims are transmitted as part of the transport header in DSP messages. The HTTP bindings for DSP do this using an `Authorization` token. DCP further specifies the header contents to be a self-signed JWT. The JWT `sub` claim contains the sender's Web DID, and the JWT is signed with a public key contained in the associated DID document (as a verification method). The data provider verifies the sending control plane's identity by resolving the DID document and checking the signed JWT against the public key.

This step only proves that the requesting control plane is operating on behalf of a participant. However, the control plane cannot yet be trusted since it must present the VC issued by the third-party auditor. DCP also specifies the JWT contains an access token in the `token` claim. The data provider uses the access token to query the data consumer's Identity Hub for a Verifiable Presentation with one or more required credentials. It obtains the endpoint of the consumer's Identity Hub from a `service` entry of type `CredentialService` in the resolved DID document. At that point, the provider connector can query the Identity Hub using the access token to obtain a Verifiable Presentation containing the required VC:

![token use](token-use.png)

Once the VP is obtained, the provider can verify the VC to establish trust with the consumer control plane.

Why not just include the VP in the token or another HTTP header and avoid the call to Identity Hub? There's a practical reason: VPs often exceed the header size limit imposed by HTTP infrastructure such as proxies. DSP and DCP could have devised the concept of a message envelope (remember WS-\* and SOAP?) but chose not to because it ties credentials to outbound client requests. To see why this is limiting, consider the scenario where a consumer requests access to an ongoing data stream. The provider control plane may set up a _policy monitor_ to periodically check the consumer's credentials while the stream is active. In the DCP model, the policy monitor can query the consumer's Identity Hub using the mechanism we described without the flow being initiated by the consumer.

#### Verifiable Presentation Generation

When the data provider issues a presentation request, the consumer Identity Hub generates a Verifiable Presentation based on the query received in the request. DCP defines two ways to specify a query: using a list of string-based _scopes_ or a [DIF Presentation Exchange presentation definition](https://identity.foundation/presentation-exchange/spec/v2.0.0/#presentation-definition). Identity Hub supports scopes only: a query with a presentation definition is answered with `501 Not Implemented`.

By default, a scope selects credentials by type or by id:

- `org.eclipse.dspace.dcp.vc.type:<Type>:read` (or `:*`, `:all`) selects the credentials of type `<Type>`. A type of the form
  `<context>#<Type>` also requires the credential's `@context` to contain `<context>`;
- `org.eclipse.dspace.dcp.vc.id:<credentialId>` selects the credential with that id.

```json
{
  "@context": [
    "https://w3id.org/dspace-dcp/v1.0/dcp.jsonld"
  ],
  "@type": "PresentationQueryMessage",
  "scope": ["org.eclipse.dspace.dcp.vc.type:AuditCertificationCredential:read"]
}
```

Identity Hub will process this as a request for the `AuditCertificationCredential` type. If the access token submitted along with the request permits the `AuditCertificationCredential`, Identity Hub will generate a Verifiable Presentation containing the `AuditCertificationCredential`. The generated VP will contain multiple credentials if more than one scope is present. Revoked, expired (including superseded) and erroneous credentials are never presented.

The mapping from scopes to credentials can be customized:

- **Discriminator mappings** replace an alias used in scopes by the actual credential type, e.g. so that a scope with
  `Membership` selects `MembershipCredential`: in the configuration (`edc.identityhub.discriminator.<name>.alias`,
  `edc.identityhub.discriminator.<name>.value`), valid for every participant, or per participant with
  `POST /v1/participants/{participantContextId}/credentials/discriminator`.
- **Scope mappings** map scopes matching a regular expression to a query criterion, with the capture groups (`$1`,
  `${1}`) of the expression. Scopes that no mapping matches are handled by the default format:

  ```properties
  edc.identityhub.scope.membership.pattern=org\\.eclipse\\.custom\\.vc\\.type:(.+):(read|\\*|all)
  edc.identityhub.scope.membership.leftoperand=verifiableCredential.credential.type
  edc.identityhub.scope.membership.operator=contains
  edc.identityhub.scope.membership.rightoperand=$1
  ```

- An extension can replace the mapping entirely with its own `ScopeToCriterionTransformer`.

The presentation format follows the format of the credentials:

| Credential format | Presentation |
|---|---|
| `VC1_0_JWT` | a JWT presentation |
| `VC1_0_LD` | a Linked-Data proof presentation (`JsonWebSignature2020`) |
| `VC2_0_JOSE` | a JWT presentation (`vp+jwt`) wrapped in an `EnvelopedVerifiablePresentation`, or the plain presentation JWT with `edc.iam.presentation.vcdm20.plain.enabled=true` |

Presentations are valid for `edc.iam.presentation.validity` seconds (default `60`). JWT-based formats are recommended:
in testing, they performed an order of magnitude better than Linked-Data proofs.

### Issuance Flow

W3C Verifiable Credentials enable a holder to present claims directly to another party without the involvement or knowledge of the credential issuer. This is essential to preserve privacy and mitigate against network outages in a dataspace. DCP defines the way Identity Hub obtains credentials from an issuer, such as the EDC [IssuerService](../issuer-service/_index.md). In DCP, issuance is an asynchronous process. The Identity Hub sends a request to the issuer endpoint, including a self-signed identity token. Similar to the presentation flow described above, the identity token contains an access token the issuer can use to send the VC to the requester's Identity Hub. This is done asynchronously. The VC could be issued immediately or after an approval process:

![issuance flow](issuance-flow.png)

Issuance can use the same claims verification as the presentation flow. For example, the auditor issuer in the previous example may require the presentation of a dataspace membership credential issued by another organization. In this case, the issuer would use the access token sent in the outbound request to query for the required credential from the Identity Hub before issuing its VC.

#### Requesting credentials

A participant requests credentials through the Identity API:

```http
POST /v1/participants/{participantContextId}/credentials/request
```

```json
{
  "issuerDid": "did:web:issuer.example.com",
  "credentials": [
    { "id": "membership-credential-def", "type": "MembershipCredential", "format": "VC1_0_JWT" }
  ]
}
```

`id` is the id of the credential object in the issuer's metadata, and `format` the format the issuer offers it in. The
answer is `201 Created`, with the request's status URL in the `Location` header,
`/v1/participants/{participantContextId}/credentials/request/{holderPid}`: `GET` on it returns the `status` of the
request. Identity Hub assigns the `holderPid` itself.

A credential request goes through the states `CREATED`, `REQUESTING` (sending the request to the issuer, retried on
failures), `REQUESTED` (accepted by the issuer, waiting for the delivery), and ends in `ISSUED` or `ERROR`. While a
request is `REQUESTED`, Identity Hub polls the issuer's request status API, with an interval that grows from
`edc.iam.credential.request.status.poll.interval` (30 s) to `edc.iam.credential.request.status.poll.max.interval`
(15 min), so that it learns about rejections. It gives up on a request after
`edc.iam.credential.request.untracked.timeout` (6 h) if the issuer never acknowledged it with an issuance process id, or
after `edc.iam.credential.request.tracked.timeout` (24 h) otherwise.

#### Receiving credentials

The issuer delivers the credentials to the holder's Storage API. Identity Hub only stores a delivered credential if it
matches an open request of the participant to that issuer, its proof verifies against a key of the issuer's DID, it is not
expired, its type and format were requested, and its subject is the holder's DID. Credentials in a format whose proof
can't be verified, e.g. with an embedded Linked-Data proof, are stored with a warning, or rejected with
`edc.iam.credential.delivery.reject.unverified=true`.

A delivered credential supersedes the earlier credentials of the same issuer, credential object and format, which are
then set to `EXPIRED` and no longer presented.

#### Credential offers

An issuer can tell a holder that a credential is ready, e.g. after it rotated its keys, with a credential offer. Identity
Hub stores the offer and requests the offered credentials automatically if the issuer is trusted: listed in
`edc.iam.credential.offer.trusted.issuers` (comma-separated DIDs), or one the participant already holds credentials from.
Offers of other issuers stay `RECEIVED` for manual handling. If the setting is not set, offers of every issuer trigger a
request, and a warning is logged: set it in production.

#### Renewal

A watchdog checks the stored credentials periodically (`edc.iam.credential.status.check.period`, default 60 s, `0`
disables it): it updates their status from their status list (revoked, suspended, expired, not yet valid), and requests
a new credential from the same issuer for the credentials that expire within `edc.iam.credential.renewal.graceperiod`
(default 7 days). The new credential supersedes the old one when it is delivered; failed renewals are retried with a
growing delay, up to 6 hours.

## Using the Identity Hub

Identity Hub is built using the EDC modularity and extensibility system. It relies on core EDC features, including
cryptographic primitives, Json-Ld processing, and DID resolution. This architecture affords a great deal of deployment flexibility. Let's break down the different supported deployment scenarios.

![ih deployments](ih-deployments.svg)

### Organizational Component

Many organizations prefer to manage identity resources centrally, as strict security and control can be enforced over these sensitive resources. Identity Hub can be deployed as a centrally managed component in an organization that other EDC components use. In this scenario, Identity Hub will manage all identity resources for an organization for all dataspaces it participates in. For example, If an organization is a member of two dataspaces, DS1 and DS2, that issue membership credentials, both credentials will be managed by the central deployment. Connectors deployed for DS1 and DS2 will use their respective membership credentials from the central Identity Hub.

### Per Dataspace Component

Some organizations may prefer to manage their identity resources at the dataspace level. For example, a multinational may participate in multiple regional dataspaces. Each dataspace may be geographically restricted, requiring all data and resources to be regionally fenced. In this case, an Identity Hub can be deployed for each regional dataspace, allowing for separate management and isolation.

### Embedded

Identity Hub is designed to scale down for edge-style deployments where footprint and latency are primary concerns. In these scenarios, Identity Hub can be deployed embedded in the same runtime process as other connector components, providing a simple, fast, and efficient deployment unit.

### Distributions

Identity Hub is assembled from the BOMs `identityhub-bom` (Identity API secured with API keys) or `identityhub-oauth2-bom`
(Identity API secured with OAuth2 tokens), both with the embedded STS, plus `identityhub-feature-sql-bom` for PostgreSQL
persistence.

## Identity Hub APIs and Resources

Identity Hub serves its APIs on separate API contexts:

| API | Context | Default port and path | Purpose |
|---|---|---|---|
| Identity API | `identity` | `15151`, `/api/identity` | management of participant contexts, keys, DIDs and credentials |
| Credentials API | `credentials` | `13131`, `/api/credentials` | DCP: presentation queries, credential storage, credential offers |
| STS API | `sts` | `9292`, `/api/sts` | token endpoint of the embedded STS |
| DID | `did` | `10100`, `/` | serves the published did:web documents |

The _DCP API_ implements the wire protocol defined by the Decentralized Claims Protocol Specification:
`POST /v1/participants/{participantContextId}/presentations/query`, `…/credentials` (storage) and `…/offers`. It is
called by other participants and issuers and must be reachable by them; its request bodies are limited to
`web.http.credentials.maxbodysize` (5 MiB). End-users generally do not interact with it.

The _Identity API_ is the primary way operators and third-party applications interact with the Identity Hub. Since the API provides access to highly sensitive resources, it's essential to secure it. **Above all, the API should never be exposed over a public network such as the Internet.**

### Authentication and authorization

The Identity API (version `v1`, e.g. `/api/identity/v1/participants`) authenticates its callers in one of two ways:

- **API keys** (`identityhub-bom`): the caller sends the API key of a participant context in the `X-Api-Key` header. A
  participant context's API key is generated when it is created, stored in the vault (alias `apiKeyAlias`, default
  `<participantContextId>-apikey`) and returned once in the response; `POST /v1/participants/{participantContextId}/token`
  generates a new one.
- **OAuth2 tokens** (`identityhub-oauth2-bom`): the caller sends a bearer token of an authorization server, validated
  against `edc.iam.oauth2.jwks.url`, and against `edc.iam.oauth2.issuer` and `edc.iam.oauth2.audience` if set (a
  warning is logged otherwise).

Access is granted by scopes, stored with the participant context (API keys) or carried by the token (OAuth2):

| Scope | Grants |
|---|---|
| `identity-api:participants:read`, `:write` | the participant context itself, its API key and STS secret |
| `identity-api:keypairs:read`, `:write` | key pairs |
| `identity-api:dids:read`, `:write` | DID documents |
| `identity-api:credentials:read`, `:write` | credentials, credential requests, discriminator mappings |
| `identity-api:read`, `identity-api:write` | all of the above |
| `identity-api:admin` | all of the above for every participant context, plus creating participant contexts, activating and deactivating them, setting their scopes, and the cross-participant listings |

`write` includes `read`, and `admin` includes both. Without the admin scope, a caller only reaches the resources of its
own participant context. A participant context with `identity-api:admin` acts as the operator's super-user. Participant
contexts get `identity-api:read` and `identity-api:write` (and the IssuerService equivalents) when they are created
without scopes; `PUT /v1/participants/{participantContextId}/scopes` changes them.

### The Participant Context

The Identity API includes CRUD operations for managing participant contexts. This API requires elevated administrative privileges.

A _participant context_ is a unit of control for resources in Identity Hub. A participant context is tied to a dataspace participant identity. Most of the time, an organization will have a single identity and use the same Web DID in multiple dataspaces. Its Identity Hub, therefore, will be configured with exactly one participant context to manage identity and credential resources.

If an organization uses different identities in multiple dataspaces, its Identity Hub will contain one participant context per identity. All resources are contained and accessed through a participant context. The participant context acts as both a _scope_ and _security_ boundary. Access control for public client API endpoints is scoped to a specific participant context. For example, the JWT access token sent to data providers described above is associated with a specific context and may not be used to access resources in another context. Furthermore, the lifecycle of participant resources is bound to their containing context; if a participant context is removed, the operation will cascade to all contained resources.

A participant context is created with `POST /v1/participants` and a _participant manifest_:

```json
{
  "participantContextId": "acme",
  "did": "did:web:acme.example.com",
  "active": true,
  "keys": [
    {
      "keyId": "did:web:acme.example.com#key-1",
      "privateKeyAlias": "acme-key-1",
      "keyGeneratorParams": { "algorithm": "EdDSA", "curve": "Ed25519" },
      "usage": ["sign_credentials", "sign_presentation", "sign_token"]
    }
  ],
  "serviceEndpoints": [
    { "id": "credential-service", "type": "CredentialService", "serviceEndpoint": "https://ih.acme.example.com/api/credentials/v1/participants/acme" }
  ]
}
```

Optional fields: `scopes` (see above), `apiKeyAlias`, `provisionApiKey` and `provisionStsAccount` (both `true` by
default; set them to `false` when the API key or the STS account are managed elsewhere), and `additionalProperties`,
which are stored as private configuration entries of the participant context. The response returns the generated
`apiKey`, and the `clientId` and `clientSecret` of the participant's STS account.

A participant context can be in one of three states:

- `CREATED` - The participant context is initialized but not operational. Resources may be added and updated, but they are not publicly accessible.
- `ACTIVATED` - The participant context is operational, and resources are publicly accessible.
- `DEACTIVATED` - The participant context is not operational. Its DID document is unpublished, its API key is rejected,
  and its DCP endpoints and STS tokens are refused. Resources may be added and updated by an admin.

The participant context can transition from `CREATED` to `ACTIVATED` and between the `ACTIVATED` and `DEACTIVATED` states.

It's useful to note that Identity Hub relies on the core EDC eventing system to enable custom extensions. Services may register to receive participant context events, for example, when a context is created or deleted, to implement custom workflows.

### DID Documents

When a participant context is created, it is associated with a DID. After a participant context is activated, a corresponding DID document will be generated and published. Currently, Identity Hub only supports Web DIDs, so publishing the document will make it available at the URL specified by the DID. Identity Hub can support other DID methods through custom extensions.

In addition, custom publishers can be created by implementing the `DidDocumentPublisher` interface and adding it via an extension to the Identity Hub runtime. For example, a publisher could deploy Web DID documents to a web server. Identity Hub includes an extension for locally publishing Web DID documents, served on the `did` API context at `/<path>`, `/<path>/did.json` and `/<path>/.well-known/did.json`. Note that this extension is not designed to handle high-volume requests, as DID documents are served directly from storage and are not cached. For these scenarios, publishing to a web server is recommended.

The verification method of each active key pair is listed under the verification relationships of its usage:
`assertionMethod` for keys that sign credentials, `authentication` for keys that sign presentations, and
`capabilityInvocation` for keys that sign tokens.

### Key Pair Resources

Key pair resources are used to sign and verify credentials, presentations, and other resources managed by Identity Hub. The public and private keys associated with a key pair resource can be generated by Identity Hub or provided when the resource is created. Identity Hub persists all private keys in a secure store and supports using Hashicorp Vault as the store.

A key pair has a `usage`: `sign_credentials`, `sign_presentation` and/or `sign_token` (all three by default). Generated
keys use `keyGeneratorParams`: `EdDSA` with `Ed25519` (the default), `EC` with `secp256r1`, `secp384r1` or `secp521r1`,
or `RSA` with 2048, 3072 or 4096 bits. Key pairs are managed with `PUT /v1/participants/{participantContextId}/keypairs`
and `POST …/keypairs/{keyPairId}/activate`, `…/rotate` and `…/revoke`.

A Key pair resource can be in one of the following states:

- `CREATED`
- `ACTIVATED`
- `ROTATED`
- `REVOKED`

Let's walk through these lifecycle states.

#### Key Activation

When a key pair is created, it is not yet used to sign resources. When a key pair is activated, Identity Hub makes the public key material available as a verification method in the participant context's DID document so that other parties can verify resources such as verifiable presentations signed by the private key. This is done by publishing an updated DID document for the participant context during the activation step.

#### Key Rotation

For security reasons, key pair resources should be periodically rotated and replaced by new ones. Identity Hub supports a staged rotation process to avoid service disruptions and ensure that existing signed resources can still be validated for a specified period.

For example, let's assume private key A is used to sign Credential CA and public key A' is used to verify CA. If the key pair A-A' is immediately revoked, CA can no longer be validated, which may cause a service disruption. Key rotation can be used to avoid this. When the key pair A-A' is rotated, a new key pair, B-B', is created and used to sign resources. The private key A is immediately destroyed. A', however, will remain as a verification method in the DID document associated with the participant context. CA validation will continue to work. When CA and all other resources signed by A expires, A' can safely be removed from the DID document.

> It's important to perform key rotation periodically to enhance overall system security. This implies that signed resources should have a validity period less than the rotation period of the key used to sign them and should also be reissued on a frequent basis.

#### Key Revocation

If a private key is compromised, it must be immediately revoked. Revocation involves removing the verification method entry in the DID document and publishing the updated version. This will invalidate all resources signed with the revoked key pair.

#### Using Vault's Transit Engine for signing

Instead of loading private key material into application memory IdentityHub can delegate sensitive signing operations to Vault's Transit engine. In this setup, Identity Hub generates key pairs in Vault and never has access to the private key material. When a signing operation is required, Identity Hub sends the data to be signed along with the key reference to Vault, which performs the signing and returns the signature. This approach enhances security by eliminating the risk of private key exposure in application memory.

The module `identity-hub-keypairs-transit` is not part of the BOMs: add it, with the HashiCorp Vault extension, to use
it. Keys can't be imported in this mode, only generated in Vault. Find details on how to configure Identity Hub to use Vault's Transit engine in the [Vault Transit documentation](https://github.com/eclipse-edc/IdentityHub/blob/main/docs/developer/architecture/vault-transit.md).

### Verifiable Credentials

Identity Hub stores the credentials it receives through the [issuance flow](#issuance-flow). Credentials can also be
added, updated and removed through the Identity API (`/v1/participants/{participantContextId}/credentials`), e.g. to
import credentials obtained by other means.

A stored credential has a status: `ISSUED`, `REVOKED`, `SUSPENDED`, `EXPIRED`, `NOT_YET_VALID` or `ERROR` (its status
couldn't be checked), and `REQUESTED` while it is being renewed. Credentials that are `REVOKED`, `EXPIRED` or in
`ERROR` are not presented.

### Secure Token Service

Identity Hub embeds a Secure Token Service (STS) that issues the self-issued tokens a participant's connector attaches to
its DSP requests, signed with the participant's token signing key. Each participant context has an STS account (client
id: the participant's DID; secret: generated at creation and stored in the vault), which the connector uses with the
OAuth2 client credentials grant:

```http
POST /api/sts/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=did:web:acme.example.com&client_secret=...&audience=did:web:provider.example.com&bearer_access_scope=org.eclipse.dspace.dcp.vc.type:MembershipCredential:read
```

The tokens are valid for `edc.iam.sts.token.expiration` minutes (default `5`). The STS API listens on `web.http.sts.port`
and `web.http.sts.path`, and on the interface `web.http.sts.host` if set. `POST /v1/participants/{participantContextId}/sts/secret`
replaces the client secret and returns the new one. On the connector side, the participant is configured with the STS
type `oauth` and the token URL, client id and secret alias of its account (see
[Participant Contexts](../control-plane/participant-contexts/_index.md#configuration-keys)).

### Security settings

| Setting | Default | Description |
|---|---|---|
| `edc.iam.accesstoken.jti.validation` | `false` | Rejects reused self-issued and access tokens (`jti` replay check); expired entries are deleted every `edc.sql.store.jti.cleanup.period` seconds (60) |
| `edc.iam.accesstoken.publickey.fallback.enabled` | `false` | Also verifies access tokens with keys that are not key pairs of the participant, from the vault or `edc.iam.publickeys`. Not scoped to the participant: leave it off unless needed for migration |
| `edc.iam.issuer.endpoint.restrict` | `false` | Calls to issuer endpoints (from their DID documents) must use HTTPS and public addresses, and don't follow redirects. Hosts listed in `edc.iam.issuer.endpoint.allowed.hosts` are exempted |
| `web.http.credentials.maxbodysize` | 5 MiB | Maximum body size of the DCP API requests (`413` above) |

## Resource Operations

Identity Hub implements transactional guarantees when resource operations are performed through the Identity API. The purpose of transactional behavior is to ensure the Identity Hub maintains a consistent state. This section catalogs those operations and guarantees.

### Participant Context Operations

#### Create

When a participant context is created, the following sequence is performed:

- A transaction is opened.
- The participant context and its configuration are stored.
- An API key is generated to access the context via the Identity API (unless `provisionApiKey` is `false`).
- An STS account and its client secret are created (unless `provisionStsAccount` is `false`).
- A DID document is created with the service endpoints of the manifest, and the key pairs are created and added to it.
- The DID document is published if the participant context is set to active when created.
- The transaction commits on success, or a rollback is performed, which also removes the secrets stored in the vault.

#### Delete

When a participant context is deleted, the following sequence is performed:

- A transaction is opened.
- The participant context is deactivated, and its DID document is unpublished.
- The DID document resource is removed from storage, and the key pairs are revoked and removed.
- The STS account and its secret, the participant's credentials, credential requests, offers and discriminator mappings are removed.
- The participant context is removed from storage.
- The transaction commits on success, or a rollback is performed.
- The API key and the private keys associated with the context are removed after the transaction is committed since Vaults are not transactional resources.

If destroying private keys fails, manual intervention will be required to clean them up. Note that the IH will be in a consistent state.

#### Activate

A participant context cannot be activated without a default key pair.

When a participant context is activated, the following sequence is performed:

- A transaction is opened.
- The context is updated in storage.
- The DID document is published.
- The transaction commits on success, or a rollback is performed.

#### Deactivate

When a participant context is deactivated, the following sequence is performed:

- A transaction is opened.
- The context is updated in storage.
- The DID document is unpublished.
- The transaction commits on success, or a rollback is performed.

There is a `force` option that will commit the transaction if the DID document unpublish operation is not successful.

### Key Pair Operations

#### Activate

This operation can only be performed when the participant context is in the `CREATED` or `ACTIVATED` state.

When a key pair is activated, the following sequence is performed:

- A transaction is opened.
- The new key pair is added to storage.
- If the DID document resource is in the `PUBLISHED` state, the DID document is published with all verification methods for public keys in the `ACTIVATED` state.
- The transaction commits on success, or a rollback is performed.

If the transaction commit fails, the DID document must be manually repaired. This can be done by republishing the DID document.

#### Rotate

When a key pair is rotated and a new one is added, the following sequence is performed:

- A transaction is opened.
- The new key pair is added to storage.
- If the DID document resource is in the `PUBLISHED` state, the DID document is published with a verification method for the new public key.
- The transaction commits on success, or a rollback is performed.
- The old private key is destroyed (note, not the old public key) after the transaction is committed since Vaults are not transactional resources.

#### Revoke

When a key pair is revoked, the following sequence is performed:

- A transaction is opened.
- The key pair state is updated.
- If the DID document resource is in the `PUBLISHED` state, the DID document is published with the verification method of the revoked public key removed.
- The transaction commits on success, or a rollback is performed.
