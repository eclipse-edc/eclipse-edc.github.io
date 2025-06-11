---
title: Contributors Manual
weight: 30
---

<!-- TOC -->
  * [0. Intended audience](#0-intended-audience)
  * [1. Getting started](#1-getting-started)
    * [1.1 Prerequisites](#11-prerequisites)
    * [1.2 Terminology](#12-terminology)
    * [1.3 Architectural and coding principles](#13-architectural-and-coding-principles)
  * [2. The control plane](#2-the-control-plane)
    * [2.1 Entities](#21-entities)
    * [2.2 Policy Monitor](#22-policy-monitor)
    * [2.3 Protocol extensions (DSP)](#23-protocol-extensions-dsp)
    * [3. (Postgre-)SQL persistence](#3-postgre-sql-persistence)
  * [4. The data plane](#4-the-data-plane)
    * [4.1 Data plane signaling](#41-data-plane-signaling)
    * [4.2 Writing a custom data plane extension (sink/source)](#42-writing-a-custom-data-plane-extension-sinksource)
    * [4.3 Writing a custom data plane (using only DPS)](#43-writing-a-custom-data-plane-using-only-dps)
  * [5. Runtime](#5-runtime)
    * [5.1 Serialization via JSON-LD](#51-serialization-via-json-ld)
    * [5.2 Programming Primitives](#52-programming-primitives)
    * [5.3 Extension model](#53-extension-model)
    * [5.4 Dependency injection deep dive](#54-dependency-injection-deep-dive)
    * [5.5 Service layers](#55-service-layers)
  * [6. Development best practices](#6-development-best-practices)
    * [6.1 Writing Unit-, Component-, Integration-, Api-, EndToEnd-Tests](#61-writing-unit--component--integration--api--endtoend-tests)
    * [6.1 Coding best practices](#61-coding-best-practices)
    * [6.2 Testing best practices](#62-testing-best-practices)
    * [6.3 Other best practices](#63-other-best-practices)
  * [6. Further concepts](#6-further-concepts)
    * [6.1 Autodoc](#61-autodoc)
    * [6.2 Adapting the Gradle build](#62-adapting-the-gradle-build)
    * [6.3 The EDC Release process](#63-the-edc-release-process)
      * [6.3.1 Releasing "core" modules](#631-releasing-core-modules)
      * [6.3.2 Releasing "technology" modules](#632-releasing-technology-modules)
<!-- TOC -->

## 0. Intended audience

This document is aimed at software developers who have already read the [adopter documentation](../for-adopters) and
want to contribute code to the Eclipse Dataspace Components project.

Its purpose is to explain in greater detail the core concepts of EDC. After reading through it, readers should have a
good understanding of EDCs inner workings, implementation details and some of the advanced concepts.

So if you are a solution architect looking for a high-level description on how to integrate EDC, or a software engineer
who wants to use EDC in their project, then this guide is not for you. More suitable resources can be found
[here](https://eclipse-edc.github.io/docs/#/README) and [here](../for-adopters) respectively.

## 1. Getting started

### 1.1 Prerequisites

This document presumes a good understanding and proficiency in the following technical areas:

- JSON and [JSON-LD](https://json-ld.org)
- HTTP/REST
- relational databases (PostgreSQL) and transaction management
- git and git workflows

Further, the following tools are required:

- Java Development Kit 17+
- Gradle 8+
- a POSIX compliant shell (bash, zsh,...)
- a text editor
- CLI tools like `curl` and `git`

This guide will use CLI tools as common denominator, but in many cases graphical alternatives exist (e.g. Postman,
Insomnia, some database client, etc.), and most developers will likely use IDEs like IntelliJ or VSCode. We are of
course aware of them and absolutely recommend their use, but we simply cannot cover and explain every possible
combination of OS, tool and tool version.

> Note that Windows is not a supported OS at the moment. If Windows is a must, we recommend using WSL2 or a setting up a
> Linux VM.

### 1.2 Terminology

- runtime: a Java process executing code written in the EDC programming model (e.g. a control plane)
- distribution: a specific combination of modules, compiled into a runnable form, e.g. a fat JAR file, a Docker image
  etc.
- launcher: a runnable Java module, that pulls in other modules to form a distribution. "Launcher" and "distribution"
  are sometimes used synonymously
- connector: a control plane runtime and 1...N data plane runtimes. Sometimes used interchangeably with "distribution".
- consumer: a dataspace participant who wants to ingest data under the access rules imposed by the provider
- provider: a dataspace participant who offers data assets under a set of access rules

### 1.3 Architectural and coding principles

When EDC was originally created, there were a few fundamental architectural principles around which we designed and
implemented all dataspace components. These include:

- **asynchrony**: all external mutations of internal data structures happen in an asynchronous fashion. While the REST
  requests to trigger the mutations may still be synchronous, the actual state changes happen in an asynchronous and
  persistent way. For example starting a contract negotiation through the API will only return the negotiation's ID, and
  the control plane will cyclically advance the negotiation's state.
- **single-thread processing**: the control plane is designed around a set of sequential [state
  machines](./control-plane/programming-primitives.md#1-state-machines), that employ pessimistic locking to guard
  against race conditions and other problems.
- **idempotency**: requests, that do not trigger a mutation, are idempotent. The same is true when provisioning external
  resources.
- **error-tolerance**: the design goal of the control plane was to favor correctness and reliability over (low) latency.
  That means, even if a communication partner may not be reachable due to a transient error, it is designed to cope with
  that error and attempt to overcome it.

Prospective contributors to the Eclipse Dataspace Components are well-advised to follow these principles and build their
applications around them.

There are other, less technical principles of EDC such as simplicity and self-contained-ness. We are extremely careful
when adding third-party libraries or technologies to maintain a simple, fast and un-opinionated platform.

Take a look at our [coding principles](../../contributing/coding-principles.md) and our
[styleguide](../../contributing/styleguide.md).

## 2. The control plane

Simply put, the control plane is the brains of a connector. Its tasks include handling protocol and API requests,
managing various internal asynchronous processes, validating policies, performing participant authentication and
delegating the data transfer to a data plane. Its job is to handle (almost) all business logic. For that, it is designed
to favor _reliability_ over _low latency_. It does **not** directly transfer data from source to destination.

The primary way to interact with a connector's control plane is through the Management API, all relevant Java modules
are located at `extensions/control-plane/api/management-api`.

### 2.1 Entities

Detailed documentation about entities can be found [here](./control-plane/entities.md)

### 2.2 Policy Monitor

The policy monitor is a component that watches over on-going transfers and ensures that the policies associated with the
transfer are still valid.

Detailed documentation about the policy monitor can be found [here](./control-plane/policy-monitor.md)

### 2.3 Protocol extensions (DSP)

This chapter describes how EDC abstracts the interaction between connectors in a Dataspace through protocol extensions
and introduces the current default implementation which follows the [Dataspace
protocol](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol) specification.

Detailed documentation about protocol extensions can be found [here](./control-plane/protocol-extensions.md)

### 3. (Postgre-)SQL persistence

PostgreSQL is a very popular open-source database and it has a large community and vendor adoption. It is also EDCs data
persistence technology of choice.

Every [store](runtime/service-layers.md#5-data-persistence) in the EDC, intended to persist state, comes out of
the box with two implementations:

- in-memory
- sql (PostgreSQL dialect)

By default, the [in-memory stores](runtime/service-layers.md#51-in-memory-stores) are provided by the dependency
injection, the SQL variants can be used by simply adding the relevant extensions (e.g. `asset-index-sql`,
`contract-negotiation-store-sql`, ...) to the classpath.

Detailed documentation about EDCs PostgreSQL implementations can be found [here](./postgres-persistence.md)

## 4. The data plane

### 4.1 Data plane signaling

Data Plane Signaling (DPS) is the communication protocol that is used between control planes and data planes. Detailed
information about it and other topics such as data plane self-registration and public API authentication can be found
[here](/documentation/for-contributors/data-plane/data-plane-signaling/).

### 4.2 Writing a custom data plane extension (sink/source)

The EDC Data Plane is build on top of the *Data Plane Framework (DPF)*, which can be used for building custom data planes.
 The framework has extensibility points for supporting different data sources and sinks (e.g., S3, HTTP, Kafka) and can 
perform direct streaming between different source and sink types.

Detailed documentation about writing a custom data plane extension can be found [here](./data-plane/_index.md#2-the-data-plane-framework).


### 4.3 Writing a custom data plane (using only DPS)

Since the communication between control plane and data plane is well-defined in the [DPS](#41-data-plane-signaling) protocol, it's possible 
to write a data plane from scratch (without using EDC and [DPF](./data-plane/_index.md#2-the-data-plane-framework)) and make it work with the EDC control plane.

Detailed documentation about writing a custom data plane be found [here](./data-plane/custom-data-plane.md).

## 5. Runtime

### 5.1 Serialization via JSON-LD

JSON-LD is a JSON-based format for serializing [Linked Data](https://www.w3.org/wiki/LinkedData), and allows adding
specific "context" to the data expressed as JSON format.
It is a [W3C](https://www.w3.org/TR/json-ld/) standard since 2010.

Detailed information about how JSON-LD is used in EDC can be found [here](runtime/json-ld.md)

### 5.2 Programming Primitives

This chapter describes the fundamental architectural and programming paradigms that are used in EDC. Typically, they
are not related to one single extension or feature area, they are of overarching character.

Detailed documentation about programming primitives can be found [here](runtime/programming-primitives.md)


### 5.3 Extension model

One of the principles EDC is built around is _extensibility_. This means that by simply putting a Java module on the
classpath, the code in it will be used to enrich and influence the runtime behaviour of EDC. For instance, contributing
additional data persistence implementations can be achieved this way. This is sometimes also referred to as "plugin".

Detailed documentation about the EDC extension model can be found [here](runtime/extension-model.md)

### 5.4 Dependency injection deep dive

In EDC, dependency injection is available to inject services into extension classes (implementors of the
`ServiceExtension` interface). The `ServiceExtensionContext` acts as service registry, and since it's not _quite_ an IoC
container, we'll refer to it simple as the "context" in this chapter.

Detailed documentation about the EDC dependency injection mechanism can be
found [here](runtime/dependency-injection.md)

### 5.5 Service layers

Like many other applications and application frameworks, EDC is built upon a vertically oriented set of different layers
that we call "service layers".

Detailed documentation about the EDC service layers can be found [here](runtime/service-layers.md)

## 6. Development best practices

### 6.1 Writing Unit-, Component-, Integration-, Api-, EndToEnd-Tests

test pyramid... Like any other project, EDC has established a set of recommendations and rules that contributors must
adhere to in order to guarantee a smooth collaboration with the project. Note that familiarity with our [formal
contribution guidelines](./guidelines) is assumed. There additional recommendations we have compiled that
are relevant when deploying and administering EDC instances.

### 6.1 Coding best practices

Code should be written to conform with the EDC [style guide](./guidelines/styleguide).

A frequent subject of critique in pull requests is logging. Spurious and very verbose log lines like "Entering/Leaving
method X" or "Performing action Z" should be avoided because they pollute the log output and don't contribute any value.

Please find detailed information about logging [here](logging.md).

### 6.2 Testing best practices

Every class in the EDC code base should have a test class that verifies the correct functionality of the code.

Detailed information about testing can be found [here](./testing.md).

### 6.3 Other best practices

Please find general best practices and recommendations [here](./best-practices.md).

## 6. Further concepts

### 6.1 Autodoc

In EDC there is an automated way to generate basic documentation about extensions, plug points, SPI modules and
configuration settings. To achieve this, simply annotate respective elements directly in Java code:

```java
@Extension(value = "Some supercool extension", categories = {"category1", "category2"})
public class SomeSupercoolExtension implements ServiceExtension {

  // default value -> not required
  @Setting(value = "Some string config property", type = "string", defaultValue = "foobar", required = false)
  public static final String SOME_STRING_CONFIG_PROPERTY = "edc.some.supercool.string";

  //no default value -> required
  @Setting(value = "Some numeric config", type = "integer", required = true)
  public static final String SOME_INT_CONFIG_PROPERTY = "edc.some.supercool.int";

  // ...
}
```

during compilation, the EDC build plugin generates documentation for each module as structured JSON.

Detailed information about autodoc can be found [here](./autodoc.md)

### 6.2 Adapting the Gradle build

The EDC build process is based on Gradle and as such uses several plugins to customize the build and centralize certain
functionality. One of these plugins has already been [discussed in the previous chapter](#62-autodoc). All of EDC's
plugins are hosted in the [GradlePlugins repository](https://github.com/eclipse-edc/GradlePlugins).

The most important plugin is the "EDC build" plugin. It consists essentially of these things:

- _a plugin class_: extends `Plugin<Project>` from the Gradle API to hook into the Gradle task infrastructure
- _extensions_: they are POJOs that are model classes for configuration.
- _conventions_: individual mutations that are applied to the project. For example, we use conventions to add some
  standard repositories to all projects, or to implement publishing to Snapshot Repository and MavenCentral in a generic way.
- _tasks_: executable Gradle tasks that perform a certain action like merging OpenAPI Specification documents.

It is important to note that a Gradle build is separated in _phases_, namely _Initialization_, _Configuration_ and
_Execution_ (see [documentation](https://docs.gradle.org/current/userguide/build_lifecycle.html)). Some of our
_conventions_ as well as other plugins have to be applied in the _Configuration_ phase.

### 6.3 The EDC Release process

Generally speaking, EDC publishes `-SNAPSHOT` build artifacts to Snapshot Repository and release build artefacts to
MavenCentral.

We further distinguish our artifacts in "core" modules and "technology" modules. The earlier consists of the Connector,
IdentityHub and FederatedCatalog as well as the RuntimeMetamodel and the aforementioned GradlePlugins. The latter is
comprised up of technology-specific implementations of core SPIs, for example cloud-based object storage or `Vault`
implementations.

#### 6.3.1 Releasing "core" modules

The build processes for two module classes are separated from one another. All modules in the "core" class are published
under the same Maven group-id `org.eclipse.edc`. This makes it necessary to publish them all at the same time, because
once publishing of an artifact of a certain group-id is completed, no artifacts with the same group-id can be published
anymore.

That means, that we cannot publish the _Connector_ repository, then the _IdentityHub_ repository and finally the
_FederatedCatalog_ repository, because by the time we get to _IdentityHub_, the publishing of _Connector_ would already
be complete and the publishing of _IdentityHub_ would fail.

The way to get around this limitation is to merge all "core" modules into _one big root project_, where the project
structure is synthesized and contains all "core" modules as subprojects, and to publish the entire _root project_. The
artifact names remain unchanged.

This functionality is implemented in the [Release repository](https://github.com/eclipse-edc/Release), which also
contains GitHub Actions workflows to publish snapshots, nightly builds and release builds.

#### 6.3.2 Releasing "technology" modules

Building and publishing releases for "technology" modules is much simpler, because they do not have to be built together
with any other repository. With them, we can employ a conventional build-and-publish approach.
