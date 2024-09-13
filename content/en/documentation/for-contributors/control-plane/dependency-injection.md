---
title: Dependency Injection
weight: 20
---


<!-- TOC -->
* [Dependency Injection](#dependency-injection)
  * [1. Registering a service implementation](#1-registering-a-service-implementation)
    * [1.1 Use `@Provider` methods (recommended)](#11-use-provider-methods-recommended)
    * [1.2 Provide "defaults"](#12-provide-defaults)
    * [1.3 Register manually (not recommended)](#13-register-manually-not-recommended)
  * [2. Injecting a service](#2-injecting-a-service)
    * [2.1 Use `@Inject` to declare dependencies (recommended)](#21-use-inject-to-declare-dependencies-recommended)
    * [2.2 Use `@Requires` to declare dependencies](#22-use-requires-to-declare-dependencies)
  * [3. Extension initialization sequence](#3-extension-initialization-sequence)
  * [4. Testing extension classes](#4-testing-extension-classes)
  * [5. Advanced concepts: default providers](#5-advanced-concepts-default-providers)
    * [5.1 Fallbacks versus extensibility](#51-fallbacks-versus-extensibility)
    * [5.2 Fallback implementations](#52-fallback-implementations)
    * [5.3 Extensibility](#53-extensibility)
    * [5.4 Deep-dive into extension lifecycle management](#54-deep-dive-into-extension-lifecycle-management)
    * [5.5 Example 1 - provider method](#55-example-1---provider-method)
    * [5.6 Example 2 - default provider method](#56-example-2---default-provider-method)
    * [5.7 Usage guidelines when using default providers](#57-usage-guidelines-when-using-default-providers)
  * [6. Limitations](#6-limitations)
<!-- TOC -->

## 1. Registering a service implementation

As a general rule, the module that provides the implementation also should register it with the
`ServiceExtensionContext`. This is done in an accompanying service extension. For example, providing a "FunkyDB" based
implementation for a `FooStore` (stores `Foo` objects) would require the following classes:

1. A `FooStore.java` interface, located in SPI:
   ```java
   public interface FooService {
       void store(Foo foo);
   }
   ```
2. A `FunkyFooStore.java` class implementing the interface, located in `:extensions:funky:foo-store-funky`:
   ```java
   public class FunkyFooStore implements FooStore {
       @Override
       void store(Foo foo){
           // ...
       }
   }
   ```
3. A `FunkyFooStoreExtension.java` located also in `:extensions:funky:foo-store-funky`. Must be accompanied by
   a _"provider-configuration file"_ as required by
   the [`ServiceLoader` documentation](https://docs.oracle.com/javase/8/docs/api/java/util/ServiceLoader.html). Code
   examples will follow below.

### 1.1 Use `@Provider` methods (recommended)

Every `ServiceExtension` may declare methods that are annotated with `@Provider`, which tells the dependency resolution
mechanism, that this method contributes a dependency into the context. This is very similar to other DI containers, e.g.
Spring's `@Bean` annotation. It looks like this:

```java
public class FunkyFooStoreExtension implements ServiceExtension {

    @Override
    public void initialize(ServiceExtensionContext context) {
        // ...
    }

    //Example 1: no args
    @Provider
    public SomeService provideSomeService() {
        return new SomeServiceImpl();
    }

    //Example 2: using context
    @Provider
    public FooStore provideFooStore(ServiceExtensionContext context) {
        var setting = context.getConfig("...", null);
        return new FunkyFooStore(setting);
    }
}
```

As the previous code snipped shows, provider methods may have no args, or a single argument, which is the
`ServiceExtensionContext`. There are a few other restrictions too. Violating these will raise an exception. Provider
methods must:

- be public
- return a value (`void` is not allowed)
- either have no arguments, or a single `ServiceExtensionContext`.

Declaring a provider method is equivalent to invoking
`context.registerService(SomeService.class, new SomeServiceImpl())`. Thus, the return type of the method defines the
service `type`, whatever is returned by the provider method determines the implementation of the service.

**Caution**: there is a slight difference between declaring `@Provider` methods and calling
`service.registerService(...)` with respect to sequence: the DI loader mechanism _first_ invokes
`ServiceExtension#initialize()`, and _then_ invokes all provider methods. In most situations this difference is
negligible, but there could be situations, where it is not.

### 1.2 Provide "defaults"

Where `@Provider` methods really come into their own is when providing default implementations. This means we can have a
fallback implementation. For example, going back to our `FooStore` example, there could be an extension that provides a
default (=in-mem) implementation:

```java
public class DefaultsExtension implements ServiceExtension {

    @Provider(isDefault = true)
    public FooStore provideDefaultFooStore() {
        return new InMemoryFooStore();
    }
}
```

Provider methods configured with `isDefault=true` are only invoked, if the respective service (here: `FooStore`) is not
provided by any other extension.

> As a general programming rule, every SPI should come with a default implementation if possible.

> Default provider methods are a tricky topic, please be sure to thoroughly read the additional documentation about
> them [here](#5-advanced-concepts-default-providers)!

### 1.3 Register manually (not recommended)

Of course, it is also possible to manually register services by invoking the respective method on
the `ServiceExtensionContext`

```java

@Provides(FooStore.class/*, possibly others*/)
public class FunkyFooStoreExtension implements ServiceExtension {

    @Override
    public void initialize(ServiceExtensionContext context) {
        var setting = context.getConfig("...", null);
        var store = new FunkyFooStore(setting);
        context.registerService(FooStore.class, store);
    }
}
```

There are three important things to mention:

1. the call to `context.registerService()` makes the object available in the context. From this point on other
   extensions can inject a `FooStore` (and in doing so will provide a `FunkyFooStore`).
2. the interface class **must** be listed in the `@Provides()` annotation, because it helps the extension loader to
   determine in which order in which it needs to initialize extensions
3. service registrations **must** be done in the `initialize()` method.

## 2. Injecting a service

As with other DI mechanisms, services should only be referenced by the interface they implement. This will keep
dependencies clean and maintain extensibility, modularity and testability. Say we have a `FooMaintenanceService` that
receives `Foo` objects over an arbitrary network channel and stores them.

### 2.1 Use `@Inject` to declare dependencies (recommended)

```java
public class FooMaintenanceService {
    private final FooStore fooStore;

    public FooMaintenanceService(FooStore fooStore) {
        this.fooStore = fooStore;
    }
}
```

Note that the example uses what we call _constructor injection_ (even though nothing is actually _injected_), because
that is needed for object construction, and it increases testability. Also, those types of instance members should be
declared `final` to avoid programming errors.

In contrast to conventional DI frameworks the `fooStore` dependency won't get auto-injected - rather, this is done in a
`ServiceExtension` that accompanies the `FooMaintenanceService` and that injects `FooStore`:

```java
public class FooMaintenanceExtension implements ServiceExtension {
    @Inject
    private FooStore fooStore;

    @Override
    public void initialize(ServiceExtensionContext context) {
        var service = new FooMaintenanceService(fooStore); //use the injected field
    }
}
```

The `@Inject` annotation on the `fooStore` field tells the extension loading mechanism that `FooMaintenanceExtension`
depends on a `FooService` and because of that, any provider of a `FooStore` must be initialized _before_ the
`FooMaintenanceExtension`. Our `FunkyFooStoreExtension` from the previous chapter provides a `FooStore`.

### 2.2 Use `@Requires` to declare dependencies

In cases where defining a field seems unwieldy or is simply not desirable, we provide another way to dynamically resolve
service from the context:

```java

@Requires({ FooService.class, /*maybe others*/ })
public class FooMaintenanceExtension implements ServiceExtension {

    @Override
    public void initialize(ServiceExtensionContext context) {
        var fooStore = context.getService(FooStore.class);
        var service = new FooMaintenanceService(fooStore); //use the resolved object
    }
}
```

The `@Requires` annotation is necessary to inform the service loader about the dependency. Failing to add it may
potentially result in a skewed initialization order, and in further consequence, in an `EdcInjectionException`.

> Both options are almost semantically equivalent, except for optional dependencies:
> while `@Inject(required=false)` allows for nullable dependencies, `@Requires` has no such option and the service
> dependency must be resolved by explicitly allowing it to be optional: `context.getService(FooStore.class, true)`.

## 3. Extension initialization sequence

The extension loading mechanism uses a two-pass procedure to resolve dependencies. First, all implementations of
of `ServiceExtension` are instantiated using their public default constructor, and sorted using a topological sort
algorithm based on their dependency graph. Cyclic dependencies would be reported in this stage.

Second, the extension is initialized by setting all fields annotated with `@Inject` and by calling its `initialize()`
method. This implies that every extension can assume that by the time its `initialize()` method executes, all its
dependencies are already registered with the context, because the extension(s) providing them were ordered at previous
positions in the list, and thus have already been initialized.

## 4. Testing extension classes

To test classes using the `@Inject` annotation, use the appropriate JUnit extension `@DependencyInjectionExtension`:

```java

@ExtendWith(DependencyInjectionExtension.class)
class FooMaintenanceExtensionTest {
    private final FooStore mockStore = mock();

    @BeforeEach
    void setUp(ServiceExtensionContext context) {
        context.registerService(FooStore.class, mockStore);
    }

    @Test
    void testInitialize(FooMaintenanceExtension extension, ServiceExtensionContext context) {
        extension.initialize(context);
        verify(mockStore).someMethodGotInvoked();
    }
}
```

## 5. Advanced concepts: default providers

In this chapter we will use the term "default provider" and "default provider method" synonymously to refer to a method
annotated with `@Provider(isDefault=true)`. Similarly, "provider", "provider method" or "factory method" refer to
methods annotated with just `@Provider`.

### 5.1 Fallbacks versus extensibility

Default provider methods are intended to provide fallback implementations for services rather than to achieve
extensibility - that is what extensions are for. There is a subtle but important semantic difference between _fallback
implementations_ and _extensibility_:

### 5.2 Fallback implementations

Fallbacks are meant as safety net, in case developers forget or don't want to add a specific implementation for a
service. It is there so as not to end up _without_ an implementation for a service interface. A good example for this
are in-memory store implementations. It is expected that an actual persistence implementation is contributed by another
extension. In-mem stores get you up and running quickly, but we wouldn't recommend using them in production
environments. Typically, fallbacks should not have any dependencies onto other services.

> Default-provided services, even though they are on the classpath, only get instantiated if there is no other
> implementation.

### 5.3 Extensibility

In contrast, _extensibility_ refers to the possibility of swapping out one implementation of a service for another by
choosing the respective module at compile time. Each implementation must therefore be contained in its own java module,
and the choice between one or the other is made by referencing one or the other in the build file. The service
implementation is typically instantiated and provided by its own extension. In this case, the `@Provider`-annotation **
must not** have the `isDefault` attribute. This is also the case if there will likely only ever be one implementation
for a service.

One example for extensibility is the `IdentityService`: there could be several implementations for it (OAuth,
DecentralizedIdentity, Keycloak etc.), but providing either one as default would make little sense, because all of them
require external services to work. Each implementation would be in its own module and get instantiated by its own
extension.

> Provided services get instantiated only if they are on the classpath, but always get instantiated.

### 5.4 Deep-dive into extension lifecycle management

Generally speaking every extension goes through these lifecycle stages during loading:

- `inject`: all fields annotated with `@Inject` are resolved
- `initialize`: the `initialize()` method is invoked. All required collaborators are expected to be resolved after this.
- `provide`: all `@Provider` methods are invoked, the object they return is registered in the context.

Due to the fact that default provider methods act a safety net, they only get invoked if no other provider method offers
the same service type. However, what may be a bit misleading is the fact that they typically get invoked _during the
`inject` phase_. The following section will demonstrate this.

### 5.5 Example 1 - provider method

Recall that `@Provider` methods get invoked regardless, and after the `initialze` phase. That means, assuming both
extensions are on the classpath, the extension that declares the provider method (= `ExtensionA`) will get fully
instantiated before another extension (= `ExtensionB`) can use the provided object:

```java
public class ExtensionA { // gets loaded first
    @Inject
    private SomeStore store; // provided by some other extension

    @Provider
    public SomeService getSomeService() {
        return new SomeServiceImpl(store);
    }
}

public class ExtensionB { // gets loaded second
    @Inject
    private SomeService service;
}
```

After building the dependency graph, the loader mechanism would first fully construct `ExtensionA`, i.e.
`getSomeService()` is invoked, and the instance of `SomeServiceImpl` is registered in the context. Note that this is
done regardless whether another extension _actually injects a `SomeService`_. After that, `ExtensionB` gets constructed,
and by the time it goes through its `inject` phase, the injected `SomeService` is already in the context, so the
`SomeService` field gets resolved properly.

### 5.6 Example 2 - default provider method

Methods annotated with `@Provider(isDefault=true)` only get invoked if there is no other provider method for that
service, and at the time when the corresponding `@Inject` is resolved. Modifying example 1 slightly we get:

```java
public class ExtensionA {

    @Inject
    private SomeStore store;

    @Provider(isDefault = true)
    public SomeService getSomeService() {
        return new SomeServiceImpl(store);
    }
}

public class ExtensionB {
    @Inject
    private SomeService service;
}
```

The biggest difference here is the point in time at which `getSomeService` is invoked. Default provider methods get
invoked _when the `@Inject` dependency is resolved_, because that is the "latest" point in time that that decision can
be made. That means, they get invoked during `ExtensionB`'s inject phase, and _not_ during `ExtensionA`'s provide phase.
There is no guarantee that `ExtensionA` is already initialized by that time, because the extension loader does not know
whether it needs to invoke `getSomeService` at all, until the very last moment, i.e. when resolving `ExtensionB`'s
`service` field. By that time, the dependency graph is already built.

Consequently, default provider methods could (and likely would) get invoked before the defining extension's `provide`
phase has completed. They even could get invoked before the `initialize` phase has completed: consider the following
situation the previous example:

1. all implementors of `ServiceExtension` get constructed by the Java `ServiceLoader`
2. `ExtensionB` gets loaded, runs through its inject phase
3. no provider for `SomeService`, thus the default provider kicks in
4. `ExtensionA.getSomeService()` is invoked, but `ExtensionA` is not yet loaded -> `store` is null
5. -> potential NPE

Because there is no explicit ordering in how the `@Inject` fields are resolved, the order may depend on several factors,
like the Java version or specific JVM used, the classloader and/or implementation of reflection used, etc.

### 5.7 Usage guidelines when using default providers

From the previous sections and the examples demonstrated above we can derive a few important guidelines:

- do not use them to achieve extensibility. That is what extensions are for.
- use them only to provide a _fallback implementation_
- they should not depend on other injected fields (as those may still be null)
- they should be in their own dedicated extension (cf. `DefaultServicesExtension`) and Java module
- do not provide and inject the same service in one extension
- rule of thumb: unless you know exactly what you're doing and why you need them - don't use them!

## 6. Limitations

- Only available in `ServiceExtension`: services can only be injected into `ServiceExtension` objects at this time as
  they are the main hook points for plugins, and they have a clearly defined interface. All subsequent object creation
  must be done manually using conventional mechanisms like constructors or builders.

- No multiple registrations: registering two implementations for an interface will result in the first registration
  being overwritten by the second registration. If both providers have the same topological ordering it is undefined
  which comes first. A warning is posted to the `Monitor`.

  _It was a conscientious architectural decision to forego multiple service registrations for the sake of simplicity and
  clean design. Patterns like composites or delegators exist for those rare cases where having multiple implementors of
  the same interface is indeed needed. Those should be used sparingly and not without good reason._

- No collection-based injection: Because there can be only ever one implementation for a service, it is not possible to
  inject a collection of implementors as it is in other DI frameworks.

- Field injection only: `@Inject` can only target fields. For example
  `public SomeExtension(@Inject SomeService someService){ ... }` would not be possible.

- No named dependencies: dependencies cannot be decorated with an identifier, which would technically allow for multiple
  service registrations (using different _tags_). Technically this is linked to the limitation of single service
  registrations.

- Direct inheritors/implementors only: this is not due to a limitation of the dependency injection mechanism, but rather
  due to the way how the context maintains service registrations: it simply maintains a `Map` containing interface class
  and implementation type.

- Cyclic dependencies: cyclic dependencies are detected by the `TopologicalSort` algorithm

- No generic dependencies: `@Inject private SomeInterface<SomeType> foobar` is not possible.
