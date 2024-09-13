---
title: Dataspaces
description: A brief introduction to what a dataspace is and how it relates to EDC.
weight: 10
---

The concept of a dataspace is the starting point for learning about the EDC. A dataspace is a *context* between one or more *participants* that share data. A participant is typically an organization, but it could be any entity, such as a service or machine.

### Dataspace Protocol (DSP): The Lingua Franca for Data Sharing

The messages exchanged in a dataspace are defined by the [Dataspace Protocol Specification (DSP)](https://github.com/eclipse-dataspace-protocol-base/DataspaceProtocol). EDC implements and builds on these asynchronous messaging patterns, so it will help to become acquainted with the specification. DSP defines how to retrieve data catalogs, conduct negotiations to create contract agreements that grant access to data, and send data over various lower-level wire protocols. While DSP focuses on the messaging layer for controlling data access, it does not specify how "trust" is established between participants. By trust, we mean on what basis a provider makes the decision to grant access to data, for example, by requiring the presentation of verifiable credentials issued by a third-party. This is specified by the [Decentralized Claims Protocol (DCP)](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol), which layers on DSP. We won't cover the two specifications here, other than to highlight a few key points that are essential to understanding how EDC works.

After reading this document, we recommend consulting the DSP and DCP specifications for further information.

### The Question of Identity

One of the most important things to understand is how identities work in a dataspace and EDC. A participant has a single identity, which is a URI. EDC supports multiple identity systems, including OAuth2 and the [Decentralized Claims Protocol (DCP).](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol) If DCP is used, the identity will be a Web DID.

An EDC component, such as a control plane, acts as a *participant agent*; in other words, it is a system that runs on behalf of a participant. Therefore, each component will use a single identity. This concept is important and nuanced. Let's consider several scenarios.

#### Simple Scenarios
##### Single Deployment

An organization deploys a single-instance control plane.  This is the simplest possible setup, although it is not very reliable or scalable. In this scenario, the connector has exactly one identity. Now take the case where an organization decides on a more robust deployment with multiple control plane instances hosted as a Kubernetes `ReplicaSet.` The control plane instances still share the same identity.

##### Distributed Deployment

EDC supports the concept of *management domains*, which are realms of control. If different departments want to manage EDC components independently, the organization can define management domains where those components are deployed. Each management domain can be hosted on distinct Kubernetes clusters and potentially run in different cloud environments. Externally, the organization's EDC infrastructure appears as a unified whole, with a single top-level catalog containing multiple sub-catalogs and data sharing endpoints.

In this scenario, departments deploy their own control plane clusters. Again, each instance is configured with the same identity across all management domains.

#### Multiple Operating Units

In some dataspaces, a single legal entity may have multiple subdivisions operating independently. For example, a multinational may have autonomous operating units in different geographic regions with different data access rights. In this case, each operating unit is a dataspace participant with a distinct identity. EDC components deployed by each operating unit will be configured with different identities. From a dataspace perspective, each operating unit is a distinct entity.
### Common Misconceptions
#### Data transfers are only about sending static files

Data can be in a variety of forms. While the EDC can share static files, it also supports open-ended transfers such as streaming and API access. For example, many EDC use cases involve providing automated access to event streams or API endpoints, including pausing or terminating access based on continual evaluation of data use policies.

#### Dataspace software has to be installed

There is no such thing as dataspace "software" or a dataspace "application." A dataspace is a decentralized context. Participants deploy the EDC and communicate with other participant systems using DSP and DCP.

#### EDC adds a lot of overhead

EDC is designed as a lightweight, non-resource-intensive engine. EDC adds no overhead to data transmission since specialized wire protocols handle the latter. For example, EDC can be used to grant access to an API endpoint or data stream. Once access is obtained, the consumer can invoke the API directly or subscribe to a stream without requiring the request to be proxied through EDC components.
#### Cross-dataspace communication vs. interoperability

There is no such thing as cross-dataspace communication. All data sharing takes place within a dataspace. However, that does not mean there is no such thing as dataspace *interoperability*. Let's unpack this.

Consider two dataspaces, DS-1 and DS-B. It's possible for a participant P-A, a member of DS-1, to share data with P-B, a member of DS-2, under one of the following conditions:
- P-A is also a member of DS-2, or
- P-B is also a member of DS-1

P-A shares data with P-B **in the context of** DS-1 or DS-2. Data does not flow between DS-1 and DS-2. It's possible for one EDC instance to operate within multiple dataspaces as long as its identity remains the same (if not, different EDC deployments will be needed).

Interoperability is different. Two dataspaces are interoperable if:

- They have compatible identity systems. For example, if both dataspaces use DCP and Web DIDs, or a form of OAuth2 with federation between the Identity Providers.
- They have a common set of verifiable credentials (or claims) and credential issuers.
- They have an agreed set of data sharing policies.

If these conditions are met, it is possible for a single connector deployment to participate in two dataspaces.
