---
title: Service Layers
weight: 10
---

<!-- TOC -->
  * [1. API controllers](#1-api-controllers)
    * [1.1 API contexts](#11-api-contexts)
    * [1.2 Registering controllers](#12-registering-controllers)
    * [1.3 Registering other resources](#13-registering-other-resources)
    * [1.4 API Authentication](#14-api-authentication)
  * [2. Validators](#2-validators)
  * [3. Transformers](#3-transformers)
  * [4. Aggregate services](#4-aggregate-services)
  * [5. Data persistence](#5-data-persistence)
    * [5.1 In-Memory stores](#51-in-memory-stores)
  * [6. Events and Callbacks](#6-events-and-callbacks)
    * [6.1 `Event` vs `EventEnvelope`](#61-event-vs-eventenvelope)
    * [6.2 Registering for events (in-process)](#62-registering-for-events-in-process)
    * [6.3 Registering for callbacks (webhooks)](#63-registering-for-callbacks-webhooks)
    * [6.4 Emitting custom events](#64-emitting-custom-events)
    * [6.5 Serialization and Deserialization of custom events](#65-serialization-and-deserialization-of-custom-events)
<!-- TOC -->

This document describes the EDC service layers.

## 1. API controllers

EDC uses JAX-RS/Jersey to expose REST endpoints, so our REST controllers look like this:

```java

@Consumes({ MediaType.APPLICATION_JSON })
@Produces({ MediaType.APPLICATION_JSON })
@Path("/v1/foo/bar")
public class SomeApiController implements SomeApi {

    @POST
    @Override
    public JsonObject create(JsonObject someApiObject) {
        //perform logic
    }
}
```

it is worth noting that as a rule, EDC API controllers only carry JAX-RS annotations, where all other annotations, such
as OpenApi should be put on the interface `SomeApi`.

In addition, EDC APIs accept their arguments as `JsonObject` due to the use of [JSON-LD](./json-ld.md).
This applies to internal APIs and external APIs alike.

API controllers should not contain any business logic other than _validation_, _serialization_ and _service invocation_.

> All API controllers perform JSON-LD expansion upon ingress and JSON-LD compaction upon egress.

### 1.1 API contexts

API controllers must be registered with the Jersey web server. To better separate the different API controllers and
cluster them in coherent groups, EDC has the notion of "web contexts". Technically, these are individual
`ServletContainer` instances, each of which available at a separate port and URL path.

To register a new _context_, it needs to be configured first:

```java

@Inject
private WebService webService;
@Inject
private WebServiceConfigurer configurer;
@Inject
private WebServer webServer;

@Override
public void initialize(ServiceExtensionContext context) {

    var defaultConfig = WebServiceSettings.Builder.newInstance()
            .apiConfigKey("web.http.yourcontext")
            .contextAlias("yourcontext")
            .defaultPath("/api/some")
            .defaultPort(10080)
            .useDefaultContext(false)
            .name("Some new API")
            .build();
    var config = context.getConfig("web.http.yourcontext"); //reads web.http.yourcontext.[port|path] from the configuration
    configurer.configure(config, webServer, defaultConfig);
}
```

### 1.2 Registering controllers

After the previous step, the `"yourcontext"` context is available with the web server and the API controller can be
registered:

```java
webservice.registerResource("yourcontext",new SomeApiController(/* arguments */)).
```

This makes the `SomeApiController` available at http://localhost:10080/api/some/v1/foo/bar. It is possible to register
multiple controllers with the same context.

> Note that the default port and path can be changed by configuring `web.http.yourcontext.port` and
> `web.http.yourcontext.path`.

### 1.3 Registering other resources

Any JAX-RS Resource (as per
the [JAX-RS Specification, Chapter 3. Resources](https://download.oracle.com/otn-pub/jcp/jaxrs-2_0-fr-eval-spec/jsr339-jaxrs-2.0-final-spec.pdf))
can be registered with the web server.

Examples of this in EDC are JSON-LD interceptors, that expand/compact JSON-LD on ingress and egress, respectively, and
`ContainerFilter` instances that are used for request authentication.

### 1.4 API Authentication

In Jersey, one way to do request authentication is by implementing the `ContainerRequestFilter` interface. Usually,
authentication and authorization information is communicated in the request header, so EDC defines the
`AuthenticationRequestFilter`, which extracts the headers from the request, and forwards them to an
`AuthenticationService` instance.

Implementations for the `AuthenticationService` interface must be registered by an extension:

```java

@Inject
private ApiAuthenticationRegistry authenticationRegistry;

@Inject
private WebService webService;

@Override
public void initialize(ServiceExtensionContext context) {
    authenticationRegistry.register("your-api-auth", new SuperCustomAuthService());

    var authenticationFilter = new AuthenticationRequestFilter(authenticationRegistry, "your-api-auth");
    webService.registerResource("yourcontext", authenticationFilter);
}
```

This registers the request filter for the web context, and registers the authentication service within the request
filter. That way, whenever a HTTP request hits the `"yourcontext"` servlet container, the request filter gets invoked,
delegating to the `SuperCustomAuthService` instance.

## 2. Validators

Extending the API controller example from the previous chapter, we add input validation. The `validatorRegistry`
variable is of type `JsonObjectValidatorRegistry` and contains `Validator`s that are registered for an arbitrary string,
but usually the `@type` field of a JSON-LD structure is used.

```java
public JsonObject create(JsonObject someApiObject) {
    validatorRegistry.validate(SomeApiObject.TYPE_FIELD, someApiObject)
            .orElseThrow(ValidationFailureException::new);

    // perform logic
}
```

A common pattern to construct a `Validator` for a `JsonObject` is to use the `JsonObjectValidator`:

```java
public class SomeApiObjectValidator {
    public static Validator<JsonObject> instance() {
        return JsonObjectValidator.newValidator()
                .verify(path -> new TypeIs(path, SomeApiObject.TYPE_FIELD))
                .verifyId(MandatoryIdNotBlank::new)
                .verifyObject(SomeApiObject.NESTED_OBJECT, v -> v.verifyId(MandatoryIdNotBlank::new))
                .verify(SomeApiObject.NAME_PROPERTY, MandatoryValue::new)
                .build();
    }
}
```

This validator asserts that, the `@type` field is equal to `SomeApiObject.TYPE_FIELD`, that the input object has an
`@id` that is non-null, that the input object has a nested object on it, that also has an `@id`, and that the input
object has a non-null property that contains the name.

Of course, defining a separate class that implements the `Validator<JsonObject>` interface is possible as well.

This validator must then be registered in the extension class with the `JsonObjectValidatorRegistry`:

```java
// YourApiExtension.java
@Override
public void initialize() {
    validatorRegistry.register(SomeApiObject.TYPE_FIELD, SomeApiObjectValidator.instance());
}
```

## 3. Transformers

Transformers are among the EDC's fundamental [programming primitives](./service-layers.md#3-transformers). They are
responsible for SerDes only, they are not supposed to perform any validation or any sort of business logic.

Recalling the code example from the [API controllers chapter](./service-layers.md#1-api-controllers), we can add
transformation as follows:

```java

@Override
public JsonObject create(JsonObject someApiObject) {
    validatorRegistry.validate(SomeApiObject.TYPE_FIELD, someApiObject)
            .orElseThrow(ValidationFailureException::new);

    // deserialize JSON -> SomeApiObject
    var someApiObject = typeTransformerRegistry.transform(someApiObject, SomeApiObject.class)
            .onFailure(f -> monitor.warning(/*warning message*/))
            .orElseThrow(InvalidRequestException::new);

    var modifiedObject = someService.someServiceMethod(someApiObject);

    // serialize SomeApiObject -> JSON
    return typeTransformerRegistry.transform(modifiedObject, JsonObject.class)
            .orElseThrow(f -> new EdcException(f.getFailureDetail()));
}
```

Note that validation should always be done first, as it is supposed to operate on the raw JSON structure. A failing
transformation indicates a client error, which is represented as a HTTP 400 error code. Throwing a
`ValidationFailureException` takes care of that.

This example assumes, that the input object get processed by the service and the modified object is returned in the HTTP
body.

> The step sequence should always be: Validation, Transformation, Aggregate Service invocation.

## 4. Aggregate services

Aggregate services are merely an _integration_ of several other services to provide a single, unified service contract
to the
caller. They should be understood as higher-order operations that delegate down to lower-level services. A typical
example in EDC is when trying to delete an `Asset`. The `AssetService` would first check whether the asset in question
is referenced by a `ContractNegotiation`, and - if not - delete the asset. For that it requires two collaborator
services, an `AssetIndex` and a `ContractNegotiationStore`.

Likewise, when creating assets, the `AssetService` would first perform some validation, then create the asset (again
using the `AssetIndex`) and the emit an [event](#6-events-and-callbacks).

Note that the validation mentioned here is different from [API validators](#2-validators). API validators only
validate the _structure_ of a JSON object, so check if mandatory fields are missing etc., whereas _service validation_
asserts that all _business rules_ are adhered to.

In addition to business logic, aggregate services are also responsible for transaction management, by enclosing relevant
code with transaction boundaries:

```java
public ServiceResult<SomeApiObject> someServiceMethod(SomeApiObject input) {
    transactionContext.execute(() -> {
        input.modifySomething();
        return ServiceResult.from(apiObjectStore.update(input))
    }
}
```

_the example presumes that the `apiObjectStore` returns a `StoreResult` object_.

- Events and callbacks

## 5. Data persistence

One important collaborator service for aggregate services is data persistence because ost operations involve some sort
of persistence interaction. In EDC, these persistence services are often called "stores" and they usually provide CRUD
functionality for entities.

Typically, stores fulfill the following contract:

- all store operations are _transactional_, i.e. they run in a `transactionContext`
- `create` and `update` are separate operations. Creating an existing object and updating a non-existent one should
  return errors
- stores should have a query method that takes a `QuerySpec` object and returns either a `Stream` or a `Collection`.
  Read the next chapter for details.
- stores return a `StoreResult`
- stores don't implement business logic.

### 5.1 In-Memory stores

By default and unless configured otherwise, EDC provides in-memory store
implementations [by default](./dependency-injection.md#12-provide-defaults). These are light-weight, thread-safe `Map`
-based implementations, that are intended for
**testing, demonstration and tutorial purposes only**.

**Querying in InMemory stores**

Memory-stores are based on Java collection types and can therefor can make use of the capabilities of the Streaming-API
for filtering and querying. What we are looking for is a way to convert a `QuerySpec` into a set of Streaming-API
expressions. This is pretty straight forward for the `offset`, `limit` and `sortOrder` properties, because there are
direct counterparts in the Streaming API.

For filter expressions (which are `Criterion` objects), we first need to convert each criterion into a `Predicate` which
can be passed into the `.filter()` method.

Since all objects held by in-memory stores are just Java classes, we can perform the query based on field names which we
obtain through Reflection. For this, we use a `QueryResolver`, in particular the `ReflectionBasedQueryResolver`.

The query resolver then attempts to find an instance field that corresponds to the `leftOperand` of a `Criterion`. Let's
assume a simple entity `SimpleEntity`:

```java
public class SimpleEntity {
    private String name;
}
```

and a filter expression

```json
{
  "leftOperand": "name",
  "operator": "=",
  "rightOperand": "foobar"
}
```

The `QueryResolver` attempts to resolve a field named `"name"` and resolve its assigned value, convert the `"="` into a
`Predicate` and pass `"foobar"` to the `test()` method. In other words, the `QueryResolver` checks, if the value
assigned to a field that is identified by the `leftOperand` matches the value specified by `rightOperand`.

Here is a full example of how querying is implemented in in-memory stores:

<details>
  <summary>Example: ContractDefinitionStore</summary>

  ```java
  public class InMemoryContractDefinitionStore implements ContractDefinitionStore {
    private final Map<String, ContractDefinition> cache = new ConcurrentHashMap<>();
    private final QueryResolver<ContractDefinition> queryResolver;

    // usually you can pass CriterionOperatorRegistryImpl.ofDefaults() here
    public InMemoryContractDefinitionStore(CriterionOperatorRegistry criterionOperatorRegistry) {
        queryResolver = new ReflectionBasedQueryResolver<>(ContractDefinition.class, criterionOperatorRegistry);
    }

    @Override
    public @NotNull Stream<ContractDefinition> findAll(QuerySpec spec) {
        return queryResolver.query(cache.values().stream(), spec);
    }

    // other methods
}
  ```

</details>

## 6. Events and Callbacks

In EDC, all processing in the control plane is asynchronous and state changes are communicated by events. The base class
for all events is `Event`.

### 6.1 `Event` vs `EventEnvelope`

Subclasses of `Event` are supposed to carry all relevant information pertaining _to the event_ such as entity IDs. They
are **not** supposed to carry event metadata such as event timestamp or event ID. These should be stored on the
`EventEnvelope` class, which also contains the `Event` class as payload.

There are two ways how events can be consumed: in-process and webhooks

### 6.2 Registering for events (in-process)

This variant is applicable when events are to be consumed by a custom extension in an EDC runtime. The term "in-process"
refers to the fact that event producer and event consumer run in the same Java process.

The entry point for event listening is the `EventRouter` interface, on which an `EventSubscriber` can be registered.
There are two ways to register an `EventSubscriber`:

- **async**: every event will be sent to the subscribers in an asynchronous way. Features:
    - fast, as the main thread won't be blocked during event dispatch
    - not-reliable, as an eventual subscriber dispatch failure won't get handled
    - to be used for notifications and for send-and-forget event dispatch
- **sync**: every event will be sent to the subscriber in a synchronous way. Features:
    - slow, as the subscriber will block the main thread until the event is dispatched
    - reliable, an eventual exception will be thrown to the caller, and it could make a transactional fail
    - to be used for event persistence and to satisfy the "at-least-one" rule

The `EventSubscriber` is typed over the event kind (Class), and it will be invoked only if the type of the event matches
the published one (instanceOf). The base class for all events is `Event`.

For example, developing an auditing extension could be done through event subscribers:

```java

@Inject
private EventRouter eventRouter;

@Override
public void initialize(ServiceExtensionContext context) {
    eventRouter.register(TransferProcessEvent.class, new AuditingEventHandler()); // sync dispatch
    // or
    eventRouter.registerSync(TransferProcessEvent.class, new AuditingEventHandler()); // async dispatch
}
```

Note that `TransferProcessEvent` is not a concrete class, it is a super class for all events related to transfer process
events. This implies that subscribers can either be registered for "groups" of events or for concrete events (e.g.
`TransferProcessStarted`).

The `AuditingEventHandler` could look like this:

```java

@Override
public <E extends Event> void on(EventEnvelope<E> event) {
    if (event.getPayload() instanceof TransferProcessEvent transferProcessEvent) {
        // react to event
    }
}
```

### 6.3 Registering for callbacks (webhooks)

This variant is applicable when adding extensions that contain event subscribers is not possible. Rather, the EDC
runtime invokes a webhook when a particular event occurs and sends event data there.

Webhook information must be sent alongside in the request body of certain Management API requests. For details, please
refer to the [Management API documentation](https://eclipse-edc.github.io/Connector/openapi/management-api). Providing
webhooks is only possible for certain events, for example when [initiating a contract
negotiation](https://eclipse-edc.github.io/Connector/openapi/management-api/#/Contract%20Negotiation%20V3/initiateContractNegotiationV3):

```json
// POST /v3/contractnegotiations
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@type": "https://w3id.org/edc/v0.0.1/ns/ContractRequest",
  "counterPartyAddress": "http://provider-address",
  "protocol": "dataspace-protocol-http",
  "policy": {
    //...
  },
  "callbackAddresses": [
    {
      "transactional": false,
      "uri": "http://callback/url",
      "events": [
        "contract.negotiation",
        "transfer.process"
      ],
      "authKey": "auth-key",
      "authCodeId": "auth-code-id"
    }
  ]
}
```

If your webhook endpoint requires authentication, the secret must be sent in the `authKey` property. The `authCodeId`
field should contain a string which EDC can use to temporarily store the secret in its secrets vault.

### 6.4 Emitting custom events

It is also possible to create and publish custom events on top of the EDC eventing system. To define the event, extend
the `Event` class.

> Rule of thumb: events should be named in past tense, to describe something that has already happened

```java
public class SomethingHappened extends Event {

    private String description;

    public String getDescription() {
        return description;
    }

    private SomethingHappened() {
    }

    // Builder class not shown
}
```

All the data pertaining an event should be stored in the `Event` class. Like any other events, custom events can be
published through the `EventRouter` component:

```java
public class ExampleBusinessLogic {
    public void doSomething() {
        // some business logic that does something
        var event = SomethingHappened.Builder.newInstance()
                .description("something interesting happened")
                .build();

        var envelope = EventEnvelope.Builder.newInstance()
                .at(clock.millis())
                .payload(event)
                .build();

        eventRouter.publish(envelope);
    }
}
```

Please note that the `at` field is a timestamp that every event has, and it's mandatory (please use the `Clock` to get
the current timestamp).

### 6.5 Serialization and Deserialization of custom events

All events must be serializable, because of this, every class that extends `Event` will be serializable to JSON through
the `TypeManager` service. The JSON structure will contain an additional field called `type` that describes the name of
the event class. For example, a serialized `EventEnvelope<SomethingHappened>` event will look like:

```json
{
  "type": "SomethingHappened",
  "at": 1654764642188,
  "payload": {
    "description": "something interesting happened"
  }
}
```

In order to make such an event deserializable by the `TypeManager` is necessary to register the type:

```java
typeManager.registerTypes(new NamedType(SomethingHappened.class, SomethingHappened .class.getSimpleName()));
```

doing so, the event can be deserialized using the `EvenEnvelope` class as type:

```
var deserialized = typeManager.readValue(json, EventEnvelope.class);
// deserialized will have the `EventEnvelope<SomethingHappened>` type at runtime
```
