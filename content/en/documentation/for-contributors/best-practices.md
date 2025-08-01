---
title: Best practices and recommendations
weight: 10
---

<!-- TOC -->
  * [1. Preface](#1-preface)
  * [2. Security recommendations](#2-security-recommendations)
    * [2.1 Exposing APIs to the internet](#21-exposing-apis-to-the-internet)
    * [2.2 Use only official TLS certificates/CAs](#22-use-only-official-tls-certificatescas)
    * [2.3 Use appropriate network infrastructure](#23-use-appropriate-network-infrastructure)
    * [2.4 A word on authentication and authorization](#24-a-word-on-authentication-and-authorization)
    * [2.5 Docker builds](#25-docker-builds)
    * [2.6 Use proper database security](#26-use-proper-database-security)
    * [2.7 Store sensitive data in a vault](#27-store-sensitive-data-in-a-vault)
  * [3. General recommendations](#3-general-recommendations)
    * [3.1 Use only official releases](#31-use-only-official-releases)
    * [3.2 Dependency hygiene](#32-dependency-hygiene)
    * [3.3 Use database persistence wherever possible](#33-use-database-persistence-wherever-possible)
    * [3.4 Use proper `Vault` implementations](#34-use-proper-vault-implementations)
    * [3.4 Use UUIDs as object identifiers](#34-use-uuids-as-object-identifiers)
<!-- TOC -->

## 1. Preface

This document aims at giving guidelines and recommendations to developers who want to use or extend EDC or EDC modules
in their applications, to DevOps engineers who are tasked with packaging and operating EDC modules as runnable
application images.

Please understand this document as a recommendation from the EDC project committers team that they compiled to the best
of their knowledge. We realize that use case scenarios are plentiful and requirements vary, and not every best practice
is applicable everywhere. You know your use case best.

This document is not an exhaustive list of prescribed steps, that will shield adopters from any conceivable harm or
danger, but rather should serve as starting point for engineers to build upon.

Finally, it should go without saying that the software of the EDC project is distributed "as is" and committers of EDC
take no responsibility or liability, direct or indirect, for any harm or damage caused by the us`e of it. This document
does not change that.

## 2. Security recommendations

### 2.1 Exposing APIs to the internet

The EDC code base has several outward-facing APIs, exclusively implemented as HTTP/REST endpoints. These have different
purposes, different intended consumers and thus different security implications.

As a general rule, **APIs should not be exposed directly to the internet**. That does not mean that they shouldn't be
_accessible_ via the internet, obviously the connector and related components cannot work without a network connection.
This only means that API endpoints should not be _directly_ facing the internet, instead, there should be [appropriate
infrastructure](#23-use-appropriate-network-infrastructure) in place.

It also means that we advise **extreme caution** when making APIs accessible via the internet - by default only the DSP
API and the data plane's public API should be accessible via the internet, the others (management API, signaling
API,...) are intended _only for local network access_, e.g. within a Kubernetes cluster.

Corporate security policies might require that only HTTPS/TLS connections be used, even between pods in a Kubernetes
cluster. While the EDC project makes no argument pro or contra, that is certainly an idea worth considering in high
security environments.

The key take-away is that all of EDC's APIs - if accessible outside the local network - should **only** be accessible
through separate software components such as API gateways or load balancers. These are specialized tools with the sole
purpose of performing authentication, authorization, rate limiting, IP blacklisting/whitelisting etc.

There is a plethora of ready-made components available, both commercial and open-source, therefor the EDC project _will
not provide that functionality._ Feature requests and issues to that effect will be ignored.

In the particular case of the DSP API, the same principle holds, although with the exception of authentication and
authorization. That is handled by the [DSP protocol
itself](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol).

We have a rudimentary token-based API security module available, which can be used to secure the connection API gateway
<-> connector if so desired. It should be noted that it is _not designed to act as a ingress point!_

> TL;DR: don't expose any APIs if you can help it, but if you must, use available tools to harden the ingress

### 2.2 Use only official TLS certificates/CAs

Typically, JVMs ship with trust stores that contain a number of widely accepted CAs. Any attempts to package additional
CAs/certificates with runtime base images are _discouraged_, as that would be problematic because:

- scalability: in a heterogenous networks one cannot assume such a custom CA to be accepted by the counterparty
- maintainability: TLS certificates expire, so there is a chance that mandatory software rollouts become necessary
  because of expired certificates lest the network breaks down completely.
- security: there have been a number of issues with CAs
  ([1](https://sslmate.com/resources/certificate_authority_failures),
  [2](https://security.googleblog.com/2024/06/sustaining-digital-certificate-security.html)), so adding non-sanctioned
  ones brings a potential security weakness

### 2.3 Use appropriate network infrastructure

As discussed earlier, EDC does not (_and will not_) provide or implement tooling to harden network ingress, as that is
an orthogonal concern, and there are tools better suited for that.

We encourage every connector deployment to plan and design their network layout and infrastructure right from the onset,
before even writing code. Adding that later can be difficult and time-consuming.

For example, in Kubernetes deployments, which are the de-facto industry standard, networking can be taken on by ingress
controllers and load balancers. Additional external infrastructure, such as API gateways are recommended to handle
authentication, authorization and request throttling.

### 2.4 A word on authentication and authorization

EDC does not have a concept of a "user account" as many client-facing applications do. In terms of identity, the
connector itself represents a participant in a dataspace, so that is the level of granularity the connector operates on.
That means, that client-consumable APIs such as the Management API only have rudimentary security. This is by design and
**must** be solved out-of-band.

The reasoning behind this is that requirements for authentication and authorization are so diverse and heterogeneous,
that it is virtually impossible for the EDC project to satisfy them all, or even most of them. In addition, there is
very mature software available that is designed for this very use case.

Therefore, adopters of EDC have two options to consider:

1. develop a custom `AuthenticationService` (or even a `ContainerRequestFilter`), that integrates with an IDP
2. use a dedicated API gateway (recommended)

Both these options are viable, and may have merit depending on the use case.

### 2.5 Docker builds

As Docker is a very popular method to build and ship applications, we put forward the following recommendations:

- use official Eclipse Temurin base images for Java
- use dedicated non-root users: in your Dockerfile, add the following lines
   ```dockerfile
    ARG APP_USER=docker
    ARG APP_UID=10100
    RUN addgroup --system "$APP_USER"
    RUN adduser \
	     --shell /sbin/nologin \
	     --disabled-password \
	     --gecos "" \
	     --ingroup "$APP_USER" \
	     --no-create-home \
	     --uid "$APP_UID" \
	     "$APP_USER"

    USER "$APP_USER"
   ```

### 2.6 Use proper database security

Database connections are secured with a username and a password. Please choose non-default users and strong passwords.
In addition, database credentials should be stored in an HSM (vault).

Further, the roles of the technical user for the connector should be limited to `SELECT`, `INSERT`, `UPDATE`, and
`DELETE`. There is no reason for that user to have permissions to modify databases, tables, permissions or execute other
DDL statements.

### 2.7 Store sensitive data in a vault

While the default behaviour of EDC is that configuration values are taken either from environment variables, system
properties or from configuration extensions, it is highly recommended to store sensitive data in a `vault` when
developing EDC extensions.

Here is a (non-exhaustive) list of examples of such sensitive values:

- database credentials
- cryptographic keys, e.g. private keys in an asymmetric key pair
- symmetric keys
- API keys/tokens
- credentials for other third-party services, even if temporary

Sensitive values should not be passed through multiple layers of code. Instead, they should be referenced by their
alias, and be resolved from the `vault` wherever they are used. Do not store sensitive data as class members but use
local variables that are garbage-collected when leaving execution scope.

## 3. General recommendations

### 3.1 Use only official releases

We recommend using _only official releases_ of our components. The latest version can be obtained from the project's
[GitHub releases page](https://github.com/eclipse-edc/Connector/releases) and the modules are available from
MavenCentral.

Snapshots are less stable, less tested and less reliable than release versions and they make for non-repeatable builds.

That said, we realize that sometimes living on the bleeding edge of technology is thrilling, or in some circumstances
even necessary. EDC components publish a `-SNAPSHOT` build on every commit the `main` branch, so there could be several
such builds per day, each overwriting the previous one. In addition, we publish nightly builds, that are versioned
`<VERSION>-<YYYYMMDD>-SNAPSHOT` and those don't get overwritten. For more information please refer to the [respective
documentation](https://eclipse-edc.github.io/docs/#/documentation/developer/releases).

### 3.2 Dependency hygiene

It should be at the top of every software engineer's todo list to keep application dependencies current, to avoid
security issues, minimize technical debt and prevent difficult upgrade paths. We strongly recommend using a tool to keep
dependencies up-to-date, or at least notify when a new version is out.

This is especially true for EDC versions. Since the project has not yet reached a state of equilibrium, where we can
follow SemVer rules, major (potentially breaking) changes and incompatibilities are to be expected on every version
increment.

Internally we use [dependabot](https://docs.github.com/en/code-security/dependabot) to maintain our dependencies, as it
is well integrated with GitHub actions, but this is not an endorsement. Alternatives exist.

### 3.3 Use database persistence wherever possible

While the connector runtime provides in-memory persistence by default, it is recommended to use database persistence in
production scenarios, if possible. Hosting the persistence of several modules (e.g. AssetIndex and
PolicyDefinitionStore) in the same database is generally OK.

This is because although memory stores are fast and easy to use, they have certain drawbacks, for instance:

- clustered deployments: multiple replica don't have the same data, thus they would operate on inconsistent data
- security: if an attacker is able to create a memdump of the pod, they gain access to all application data
- memory consumption: Kubernetes has no memory limits out-of-the-box, so depending on the amount of data that is stored
  by a connector, this could cause runtime problems when databases start to grow, especially on resource constrained
  deployments.

### 3.4 Use proper `Vault` implementations

Similar to the previous section, proper HSM (`Vault`) implementations should be used in all but the most basic test and
demo scenarios. Vaults are used to store the [most sensitive information](#27-store-sensitive-data-in-a-vault), and by
default EDC provides only an in-memory variant.


### 3.4 Use UUIDs as object identifiers

While we don't enforce any particular shape or form for object identifiers, we recommend using UUIDs because they are
_reasonably_ unique, _reasonably_ compact, and _reasonably_ available on most tech stacks. Use the JDK UUID
implementation. It's good enough.
