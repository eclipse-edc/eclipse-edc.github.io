# Technical Direction for a Robust Decentralized EDC Identity and Trust System

## Decision

This decision record establishes the technical direction for developing an EDC identity and trust system that can be
used in
place of the existing OAuth2-based system when required. This system will be built on existing EDC infrastructure,
including the `Identity Hub.`

## Rationale

Identity and trust are the cornerstones of a dataspace. Currently, the EDC has production-quality support for the
exchange of identity and claims information using
the [OAuth 2 Client Credentials Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4). For many use cases,
relying on a centralized OAuth 2 Authorization Server is sufficient. However, there are a class of uses-cases which
require a decentralized approach to exchanging identity and claims data. For example, operational continuity
requirements may determine that a centralized Authentication Server poses too great a risk of service disruption. Or,
privacy rules may dictate that claims verification must be done without requiring both the verifying and verified party
being
known to a third-party identity provider.

The decentralized identity and trust system will enable dataspace participants to securely communicate and validate
credentials using
the [Dataspace Protocol Specifications](https://github.com/International-Data-Spaces-Association/ids-specification) (
DSP) in a way that preserves privacy and limits the possibility of network disruption.

## Approach

The EDC identity and trust system will implement a set of message interactions (termed "protocols") for the following:

- **Self-Issued Identity Tokens**: Obtaining and cryptographically validating self-issued tokens that contain identity
  claims
- **Verifiable Credential Presentation**: Communicating Verifiable Credentials (VC), Verifiable Presentations (VP), and
  the cryptographic material needed to validate them
- **Verifiable Credential Issuance**: Issuing and renewing Verifiable Credentials and providing a mechanism for
  communicating credential revocation

The protocol specifications will be temporarily maintained in
the [Eclipse Tractus-X SSI repository](https://github.com/eclipse-tractusx/ssi-docu), but will be transferred to the
Eclipse Dataspace Working Group as described [here](#protocol-specifications-and-the-eclipse-dataspace-working-group).

### Self-Issued Identity Tokens

The shape of self-issued identity tokens and protocol for obtaining them will be based on
the [Self-Issued OpenID Provider v2 specification](https://openid.net/specs/openid-connect-self-issued-v2-1_0.html#section-1.1) (
SIOPv2).

### Verifiable Credential Presentation

Data providers will often require a set of Verifiable Presentations (i.e. the presentation of a Verifiable Credential)
to access their assets. In addition, trust anchors such as Credential Issuers need a way to deliver Verifiable
Credentials to a holder.

The Verifiable Presentation protocol will define a set of operations for reading and writing Verifiable Credentials
using the W3C [Verifiable Credentials Data Model v1.1](https://www.w3.org/TR/vc-data-model/). The protocol will also
make use of
the [DIF Presentation Exchange specification](https://identity.foundation/presentation-exchange/spec/v2.0.0/).

Note that
the [OpenID for Verifiable Presentations specification](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#section-6.1)
was considered, but determined not to be sufficient, due to its focus on end-user as opposed to service-to-service
interactions. [DidComm Messaging](https://identity.foundation/didcomm-messaging/spec/) was also investigated as a
potential starting point but not selected due to unneeded complexity and lack of widespread adoption.

### Verifiable Credential Issuance

Dataspaces will require an interoperable way for participant agent systems to request credential issuance, renew
credentials, and check for credential revocation. The Verifiable Credential Issuance will define a RESTful API over
HTTPS that uses the [W3C Decentralized Identifiers specification](https://www.w3.org/TR/did-core/) and
the [W3C Status List specification](https://www.w3.org/TR/vc-status-list/).

Note that
the [OpenID for Verifiable Credential Issuance specification](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-introduction)
was considered, but determined not to be sufficient, due to its focus on end-user interactions and lack of support for
long-running issuance processes that may involve human interaction.

### Protocol Specifications and The Eclipse Dataspace Working Group

The protocol specifications (i.e. documents that define the message exchanges) for the Identity and Trust System will be
transferred to the [Eclipse Dataspace Working Group](https://www.eclipse.org/org/workinggroups/dataspace-charter.php)
for standardization. The EDC will track changes to the protocol specifications as they undergo standardization.

## Impact

The decentralized Identity and Trust System will have negligible architectural impact, as this work will be an extension
of existing EDC services. The most notable impact will be on the wire protocol used by the `Identity Hub.`

### Identity Hub

The `Identity Hub` is currently based on an early version of
the [Decentralized Web Nodes specification](https://identity.foundation/decentralized-web-node/spec/) (DWN).
The `Identity Hub` lacks several important features including VC revocation, key rotation, and permission-based access.
Although the DWN standard specifies a permission-based access method, it is not compatible with OAuth 2 and SIOPv2.
Moreover, the goal of the DWN specification is to define a generic credential storage and message relay system. As such,
it does not address key topics including credential metadata exchange. The DWN specification will therefore be replaced
by the protocol specifications mentioned above, which will be aligned with standards including SIOPv2, DIF Presentation
Exchange, and W3C DID. Note that this will have no end-user impact as only the `Identity Hub` wire protocol will be
changed.

### Issuance Service

A new `Issuance Service` will be created to support VC issuance and revocation. This service will be built on existing
core EDC components and deployable as a standalone or embedded service.

