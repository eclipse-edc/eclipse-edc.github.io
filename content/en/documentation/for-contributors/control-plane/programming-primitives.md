---
title: Programming Primitives
weight: 10
---

<!-- TOC -->
  * [1 State machines](#1-state-machines)
    * [1.1 Batch-size, sorting and tick-over timeout](#11-batch-size-sorting-and-tick-over-timeout)
    * [1.2 Database-level locking](#12-database-level-locking)
  * [2. Transformers](#2-transformers)
    * [2.1 Basic Serialization and Deserialization](#21-basic-serialization-and-deserialization)
    * [2.1 Transformer context](#21-transformer-context)
    * [2.2 Segmented transformer registries](#22-segmented-transformer-registries)
    * [2.3 Reporting transformation errors](#23-reporting-transformation-errors)
  * [3. Token generation and decorators](#3-token-generation-and-decorators)
  * [4. Token validation and rules](#4-token-validation-and-rules)
    * [4.1 Public Key Resolvers](#41-public-key-resolvers)
    * [4.2 Validation Rules](#42-validation-rules)
    * [4.3 Validation Rules Registry](#43-validation-rules-registry)
<!-- TOC -->

## 1 State machines

EDC is asynchronous by design, which means that processes are processed in such a way that they don't block neither the
runtime nor the caller. For example starting a contract negotiation is a long-running process and every contract
negotiation has to traverse a series of
[states](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol/contract-negotiation/contract.negotiation.protocol#id-1.2-state-machine),
most of which involve sending remote messages to the counter party. These state transitions are not guaranteed to happen
within a certain time frame, they could take hours or even days.

From that it follows that an EDC instance must be regarded as ephemeral (= they can't hold state in memory), so the
state (of a contract negotiation) must be held in persistent storage. This makes it possible to start and stop connector
runtimes arbitrarily, and every replica picks up where the other left off, without causing conflicts or processing an
entity twice.

The state machine itself is synchronous: in every iteration it processes a number of objects and then either goes back
to sleep, if there was nothing to process, or continues right away.

At a high level this is implemented in the `StateMachineManager`, which uses a set of `Processor`s. The
`StateMachineManager` sequentially invokes each `Processor`, who then reports the number of processed entities. In EDC's
state machines, processors are functions who handle `StatefulEntities` in a particular state and are registered when the
application starts up:

```java
// ProviderContractNegotiationManagerImpl.java

@Override
protected StateMachineManager.Builder configureStateMachineManager(StateMachineManager.Builder builder) {
    return builder
            .processor(processNegotiationsInState(OFFERING, this::processOffering))
            .processor(processNegotiationsInState(REQUESTED, this::processRequested))
            .processor(processNegotiationsInState(ACCEPTED, this::processAccepted))
            .processor(processNegotiationsInState(AGREEING, this::processAgreeing))
            .processor(processNegotiationsInState(VERIFIED, this::processVerified))
            .processor(processNegotiationsInState(FINALIZING, this::processFinalizing))
            .processor(processNegotiationsInState(TERMINATING, this::processTerminating));
}

```

This instantiates a `Processor` that binds a given state to a callback function. For example `AGREEING` ->
`this::processAgreeing`. When the `StateMachineManager` invokes this `Processor`, it loads all contract negotiations in
that state (here: `AGREEING`) and passes each one to the `processAgreeing` method.

All processors are invoked sequentially, because it is possible that one single entity transitions to multiple states in
the same iteration.

### 1.1 Batch-size, sorting and tick-over timeout

In every iteration the state machine loads multiple `StatefulEntity` objects from the database. To avoid overwhelming
the state machine and to prevent entites from becoming stale, two main safeguards are in place:

- batch-size: this is the maximum amount of entities per state that are fetched from the database
- sorting: `StatefulEntity` objects are sorted based on when their state was last updated, oldest first.
- iteration timeout: if no `StatefulEntities` were processed, the statemachine simply yields for a configurable amount
  of time.

### 1.2 Database-level locking

In production deployments the control plane is typically replicated over several instances for performance and
robustness. This must be considered when loading `StatefulEntity` objects from the database, because it is possible that
two replicas attempt to load the same entity at the same time, which - without locks - would lead to a race condition,
data inconsistencies, duplicated DSP messages and other problems.

To avoid this, EDC employs pessimistic exclusive locks on the database level for stateful entities, which are called
`Lease`. These are entries in a database that indicate whether an entity is currently leased, whether the lease is
expired and which replica leased the entity. Attempting to acquire a lease for an already-leased entity is only possible
if the
lease holder is the same.

> Note that the value of the `edc.runtime.id` property is used to record the holder of a `Lease`. It is _recommended not
> to configure_ this property in clustered environments so that randomized runtime IDs (= default) are used.

Generally the process is as follows:

- load `N` "leasable" entities and acquire a lease for each one. An entity is considered "leasable" if it is not already
  leased, or the current runtime already holds the lease, or the lease is expired.
- if the entity was processed, advance state, free the lease
- if the entity was not processed, free the lease

That way, each replica of the control plane holds an exclusive lock for a particular entity while it is trying to
process and advance its state.

## 2. Transformers

EDC uses JSON-LD serialization on API ingress and egress. For information about this can be found [in this
chapter](./json-ld.md), but the TL;DR is that it is necessary because of extensible properties and
namespaces on wire-level DTOs.

### 2.1 Basic Serialization and Deserialization

On API ingress and egress this means that conventional serialization and deserialization ("SerDes") cannot be achieved
with Jackson, because Jackson operates on a configurable, but ultimately rigid schema.

For that reason, EDC implements its own SerDes layer, called "transformers". The common base class for all transformers
is the `AbstractJsonLdTransformer<I,O>` and the naming convention is `JsonObject[To|From]<Entity>Transformer` for
example `JsonObjectToAssetTransformer`. They typically come in pairs, to enable both serialization and deserialization.

Another rule is that the entity class must contain the fully-qualified (expanded) property names as constants and
typical programming patterns are:

- deserialization: transformers contain a `switch` statement that parses the property names and populates the entity's
  builder.
- serialization: transformers simply construct the `JsonObject` based on the properties of the entity using a
  `JsonObjectBuilder`

### 2.1 Transformer context

Many entities in EDC are complex objects that contain other complex objects. For example, a `ContractDefinition`
contains the asset selector, which is a `List<Criterion>`. However, a `Criterion` is also used in a `QuerySpec`, so it
makes sense to extract its deserialization into a dedicated transformer. So when the
`JsonObjectFromContractDefinitionTransformer` encounters the asset selector property in the JSON structure, it delegates
its deserialization back to the `TransformerContext`, which holds a global list of type transformers (
`TypeTransformerRegistry`).

As a general rule of thumb, a transformer should only deserialize first-order properties, and nested complex objects
should be delegated back to the `TransformerContext`.

Every module that contains a type transformer should register it with the `TypeTransformerRegistry` in its accompanying
extension:

```java

@Inject
private TypeTransformerRegistry typeTransformerRegistry;

@Override
public void initialize(ServiceExtensionContext context) {
    typeTransformerRegistry.register(new JsonObjectToYourEntityTransformer());
}
```

### 2.2 Segmented transformer registries

One might encounter situations, where different serialization formats are required for the same entity, for example
`DataAddress` objects are serialized differently on
the [Signaling API](../contributor-handbook.md#210-data-plane-signaling) and
the [DSP API](../contributor-handbook.md#28-protocol-extensions-dsp).

If we would simply register both transformers with the transformer registry, the second registration would overwrite the
first, because both transformers have the same input and output types:

```java
public class JsonObjectFromDataAddressTransformer extends AbstractJsonLdTransformer<DataAddress, JsonObject> {
    //...
}

public class JsonObjectFromDataAddressDspaceTransformer extends AbstractJsonLdTransformer<DataAddress, JsonObject> {
    //...
}
```

Consequently, all `DataAddress` objects would get serialized in the same way.

To overcome this limitation, EDC has the concept of _segmented_ transformer registries, where the segment is defined by
a string called a "context":

```java

@Inject
private TypeTransformerRegistry typeTransformerRegistry;

@Override
public void initialize(ServiceExtensionContext context) {
    var signalingApiRegistry = typeTransformerRegistry.forContext("signaling-api");
    signalingApiRegistry.register(new JsonObjectFromDataAddressDspaceTransformer(/*arguments*/));

    var dspRegistry = typeTransformerRegistry.forContext("dsp-api");
    dspRegistry.register(new JsonObjectToDataAddressTransformer());
}
```

_Note that this example serves for illustration purposes only!_

Usually, transformation happens in API controllers to deserialize input, process and serialize output, but controllers
don't use transformers directly because more than one transformer may be required to correctly deserialize an object.
Rather, they have a reference to a `TypeTransformerRegistry` for this. For more information please refer to the [chapter
about service layers](./service-layers.md).

### 2.3 Reporting transformation errors

Generally speaking, input validation should be performed by [validators](./service-layers.md#2-validators). However, it
is still possible that an object cannot be serialized/deserialized correctly, for example when a property has has the
wrong type, wrong multiplicity, cannot be parsed, unknown property, etc. Those types of errors should be reported to the
`TransformerContext`:

```java
// JsonObjectToDataPlaneInstanceTransformer.java
private void transformProperties(String key, JsonValue jsonValue, DataPlaneInstance.Builder builder, TransformerContext context) {
    switch (key) {
        case URL -> {
            try {
                builder.url(new URL(Objects.requireNonNull(transformString(jsonValue, context))));
            } catch (MalformedURLException e) {
                context.reportProblem(e.getMessage());
            }
        }
        // other properties
    }
}
```

Transformers should report errors to the context instead of throwing exceptions. Please note that basic JSON validation
should be performed by [validators](./service-layers.md#2-validators).

## 3. Token generation and decorators

A token is a datastructure that consists of a header and claims and that is signed with a private key. While EDC
is able to create any type of tokens through [extensions](./extension-model.md), in most use cases JSON Web Tokens (JWT)
are a good option.

The `TokenGenerationService` offers a way to generate such a token by passing in a reference to a private key and a set
of `TokenDecorators`. These are functions that mutate the parameters of a token, for example they could contribute
claims and headers to JWTs:

```java
TokenDecorator jtiDecorator = tokenParams -> tokenParams.claim("jti", UUID.randomUuid().toString());
TokenDecorator typeDecorator = tokenParams -> tokenParams.header("typ", "JWT");
var token = tokenGenerationService.generate("my-private-key-id", jtiDecorator, typeDecorator);
```

In the EDC code base the `TokenGenerationService` is not intended to be injectable, because client code typically should
be opinionated with regards to the token technology.

## 4. Token validation and rules

When receiving a token, EDC makes use of the `TokenValidationService` facility to verify and validate the incoming
token. Out-of-the-box JWTs are supported, but other token types could be supported through
[extensions](./extension-model.md). This section will be limited to validating JWT tokens.

Every JWT that is validated by EDC _must_ have a `kid` header indicating the ID of the public key with which the token
can be verified. In addition, a `PublicKeyResolver` implementation is required to download the public key.

### 4.1 Public Key Resolvers

`PublicKeyResolvers` are services that resolve public key material from public locations. It is common for organizations
to publish their public keys as JSON Web Key Set (JWKS) or as [verification
method](https://www.w3.org/TR/did-core/#verification-methods) in a DID document. If operational circumstances require
that multiple resolution strategies be supported at runtime, the recommended way to achieve this is to implement a
`PublicKeyResolver` that dispatches to multiple sub-resolvers based on the shape of the key ID.

> Sometimes it is necessary for the connector runtime to resolve its own public key, e.g. when validating a token that
> was
> sent out in a previous interaction. In these cases it is best to avoid a remote call to a DID document or a JWKS URL,
> but to resolve the public key locally.

### 4.2 Validation Rules

With the public key the validation service is able to _verify_ the token's signature, i.e. to assert its cryptographic
integrity. Once that succeeds, the `TokenValidationService` parses the token string and applies all
`TokenValidationRules` on the claims. We call this _validation_, since it asserts the correct ("valid") structure of the
token's claims.

### 4.3 Validation Rules Registry

Usually, tokens are validated in different _contexts_, each of which brings its own validation rules. Currently, the
following token validation contexts exist:

- `"dcp-si"`: when validating Self-Issued ID tokens in the Decentralized Claims Protocol (DCP)
- `"dcp-vc"`: when validating VerifiableCredentials that have an external proof in the form of a JWT (JWT-VCs)
- `"dcp-vp"`: when validating VerifiablePresentations that have an external proof in the form of a JWT (JWT-VPs)
- `"oauth2"`: when validating OAuth2 tokens
- `"management-api"`: when validating external tokens in the Management API ingress (relevant when delegated
  authentication is used)

Using these contexts it is possible to register additional validation rules using extensions:

```java
//YourSpecialExtension.java

@Inject
private TokenValidationRulesRegistry rulesRegistry;

@Override
public void initialize(ServiceExtensionContext context) {
    rulesRegistry.addRule(DCP_SELF_ISSUED_TOKEN_CONTEXT, (claimtoken, additional) -> {
        var checkResult = ...// perform rule check
        return checkResult;
    });
}
```

This is useful for example when certain dataspaces require additional rules to be satisfied or even [private
claims](https://datatracker.ietf.org/doc/html/rfc7519#section-4.3) to be exchanged.
