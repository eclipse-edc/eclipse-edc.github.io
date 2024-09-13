---
title: For Adopters
description: What does your user need to know to try your project?
weight: 20
---

Many organizations face the challenge of securely sharing data with their partners or other trusted third parties. In
the past, this has been the realm of proprietary EDI solutions. EDC is an alternative to these systems built on the
concept of [dataspaces](https://dataspace.eclipse.org/). EDC is a set of components that enable developers to create dataspaces using the following
building blocks:

- **Identity service** for managing and verifying organizational credentials using [DIDs](https://www.w3.org/TR/did-core/)
  and [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) or OAuth2 tokens.
- **Catalog service** for publishing and securing assets that can be shared with other organizations.
- **Negotiation service** for the automated creation and processing of data usage agreements that grant access to data.
- **Data transfer and monitoring services** for automatically initiating and managing data transfers using off-the-shelf
  protocols such as `HTTP`, `Kafka`, cloud object storage, or virtually any other technology.

EDC is designed to serve a range of use cases, including large AI data sets, API access, supply-chain data processing,
and research data sharing.

EDC components are standards-based and implement the [Dataspace Protocol Specification](https://github.com/eclipse-dataspace-protocol-base/DataspaceProtocol)
and [Decentralized Claims Protocol Specification](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol).

## What EDC is not

EDC is not a data processing platform, integration framework, or messaging bus. EDC is also not a prepackaged system or
application. Rather, it is a toolbox for building customized distributions. As a generic toolbox, EDC:

- Does not ship an installable distribution; those are provided by downstream projects that customize EDC to their
  needs.
- Does not contain use case-specific features; those are added through EDC's *modularity and extension system* (more on
  that below).
- Does not provide infrastructure for storing, processing, or moving data; EDC integrates with third-party *data planes*
  to provide these services.

## The Samples

The quickest way to get started building with EDC is to work through
the [samples](https://github.com/eclipse-edc/Samples). The samples cover everything from basic scenarios involving
sharing files to advanced streaming and large data use cases.

## The MVD

The [EDC Minimal Viable Dataspace (MVD)](https://github.com/eclipse-edc/MinimumViableDataspace) sets up and runs a
complete demonstration dataspace between two organizations. The MVD includes automated setup of a complete dataspace
environment in a few minutes.

## Overview: Key Components

EDC is architected as modules called _extensions_ that can be combined and customized to create _components_
that perform specific tasks. These components (the "C" in EDC) are **not** what is commonly referred to as "
microservices." Rather, EDC components may be deployed as separate services or collocated in a runtime process. This
section provides a quick overview of the key EDC components.

### The Connector

The Connector is a pair of components that _control_ data sharing and _execute_ data transfer. These components are the
**_Control Plane_** and **_Data Plane,_** respectively. In keeping with EDC's modular design philosophy, connector
components may be deployed in a single monolith (for simple use cases) or provisioned as clusters of individual
services. It is recommended to separate the Control Plane and Data Plane so they can be individually managed and scaled.

![Control and Data Planes](control-and-data-planes.svg)

#### The Control Plane

The Control Plane is responsible for creating contract agreements that grant access to data, managing data transfers,
and monitoring usage policy compliance. For example, a data consumer's control Plan initiates a contract negotiation
with a data provider's connector. The negotiation is an asynchronous process that results in a *contract agreement* if
approved. The consumer connector then uses the contract agreement to initiate a *data transfer* with the provider
connector. A data transfer can be a one-shot (finite) transfer, such as a discrete set of data, or an ongoing (
non-finite) data stream. The provider control plane can pause, resume, or terminate transfers in response to certain
conditions. For example, if a contract agreement expires.

#### The Data Plane

The Data Plane is responsible for executing data transfers, which are managed by the Control Plane. A Data Plane sends
data using specialized technology such as a messaging system or data integration platform. EDC includes the *Data Plane
Framework (DPF)* for building custom Data Planes. Alternatively, a Data Plane can be built using other languages or
technologies and integrated with the EDC Control Plane by implementing
the [Data Plane Signaling API](https://github.com/eclipse-edc/Connector/blob/main/docs/developer/data-plane-signaling/data-plane-signaling.md).

### Federated Catalog

The Federated Catalog (FC) is responsible for crawling and caching data catalogs from other participants. The FC builds
a local cache that can be queried or processed without resorting to complex distributed queries across multiple
participants.

### Identity Hub

The Identity Hub securely stores and manages W3C Verifiable Credentials, including the presentation of VCs and the
issuance and re-issuance process.

### The Big Picture: The Dataspace Context

EDC components are deployed to create a dataspace ecosystem. It is important to understand that there is no such thing
as "dataspace software." At its most basic level, a dataspace is simply a context between two participants:

![](big-picture.svg)

The **Federated Catalog** fetches data catalogs from other participants. A **Connector** negotiates a contract agreement
for data access between two participants and manages data transfers using a data plane technology. The **Identity Hub**
presents verifiable credentials that a participant connector uses to determine whether it trusts and should grant data
access to a counterparty.

The above EDC components can be deployed in a single runtime process (e.g., K8S ReplicaSet) or a distributed topology (
multiple ReplicaSets or clusters). The connector components can be further decomposed. For example, multiple control
plane components can be deployed within an organization in a federated manner where departments or subdivisions manage
specific instances termed `Management Domains`.

### Customizing the EDC

EDC was designed with the philosophy that one size does not fit all. Before deploying an EDC-powered data sharing
ecosystem, you'll need to build customizations and bundle them into one or more distributions. Specifically:

- **Policies** - Create a set of policies for data access and usage control. EDC adopts a code-first approach, which
  involves writing *policy functions*.
- **Verifiable Credentials** - Define a set of W3C Verifiable Credentials for your use cases that your policy functions
  can process. For example, a credential that identifies a particular partner type.
- **Data transfer types** - Define a set of data transfer technologies or types that must be supported. For example,
  choose out-of-the-box support for HTTP, S3-based transfers, or Kafka. Alternatively, you can select your preferred
  wire protocol and implement a custom data plane.
- **Backend connectivity** - You may need to integrate EDC components with back-office systems. This is done by writing
  custom extensions.

Third parties and other open source projects distribute EDC extensions that can be included in a distribution. These
will typically be hosted on Maven Central.
