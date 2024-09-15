---
title: Documentation
menu: {main: {weight: 20}}
weight: 20

cascade:
  - type: "docs"
---

{{% pageinfo %}}
Welcome to the EDC, a framework for building globally-scalable data sharing services. 
{{% /pageinfo %}}
   
Many organizations face the challenge of securely sharing data with their partners or other trusted third parties. In
the past, this has been the realm of proprietary EDI solutions. EDC is an alternative to these systems built on the
concept of [dataspaces](https://dataspace.eclipse.org/). EDC is a set of components that enable developers to create
dataspaces using the following building blocks:

- **Identity service** for managing and verifying organizational credentials
  using [DIDs](https://www.w3.org/TR/did-core/)
  and [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) or OAuth2 tokens.
- **Catalog service** for publishing and securing assets that can be shared with other organizations.
- **Control plane services** for the automated creation and processing of data usage agreements that grant access to
  data.
- **Data plane and monitoring services** for initiating and managing data transfers using off-the-shelf protocols such
  as `HTTP`, `Kafka`, cloud object storage, or virtually any other technology.

EDC is designed to serve a range of use cases, including large AI data sets, API access, supply-chain data processing,
and research data sharing.

EDC components are standards-based and implement
the [Dataspace Protocol Specification](https://github.com/eclipse-dataspace-protocol-base/DataspaceProtocol)
and [Decentralized Claims Protocol Specification](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol).

## What EDC is not

EDC is not a data processing platform, integration framework, or messaging bus. EDC is also not a prepackaged system or
application. Rather, it is a toolbox for building customized distributions. As a generic toolbox, EDC:

- Does not ship an installable distribution; those are provided by downstream projects that customize EDC to their
  needs.
- Does not contain use case-specific features; those are added through EDC's *modularity and extension system.*
- Does not provide infrastructure for storing, processing, or moving data; EDC integrates with third-party *data planes*
  to provide these services.

## What Next?

If you are new to EDC, start with the [Adopters Manual](for-adopters). If you are an experienced EDC developer and
want to take a deep-dive into the codebase, see the [Contributors Manual](for-contributors).   


