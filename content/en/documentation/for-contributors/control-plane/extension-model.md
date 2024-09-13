---
title: Extension Model
weight: 30
---

<!-- TOC -->
* [1. Extension basics](#1-extension-basics)
* [2. Autodoc and Metamodel Annotations](#2-autodoc-and-metamodel-annotations)
* [3. Configuration and best practices](#3-configuration-and-best-practices)
<!-- TOC -->

## 1. Extension basics

Three things are needed to register an extension module with the EDC runtime:

1. a class that implements `ServiceExtension`
2. a [provider-configuration file](https://docs.oracle.com/javase/7/docs/api/java/util/ServiceLoader.html)
3. adding the module to your runtime's build file. EDC uses Gradle, so your runtime build file should contain

```groovy
runtimeOnly(project(":module:path:of:your:extension"))
```

Extensions should **not** contain business logic or application code. Their main job is to

- read and handle [configuration](./extension-model.md#3-configuration-and-best-practices)
- instantiate and register services with the service context (read more [here](./dependency-injection.md))
- allocate and free resources, for example scheduled tasks

## 2. Autodoc and Metamodel Annotations

EDC can automatically generate documentation about its extensions, about the settings used therein and about its
extension points. This feature is available as Gradle task:

```bash
./gardlew autodoc
```

Upon execution, this task generates a JSON file located at `build/edc.json`, which contains structural information about
the extension, for example:

<details>
  <summary>Autodoc output in edc.json</summary>

```json
[
  {
    "categories": [],
    "extensions": [
      {
        "categories": [],
        "provides": [
          {
            "service": "org.eclipse.edc.web.spi.WebService"
          },
          {
            "service": "org.eclipse.edc.web.spi.validation.InterceptorFunctionRegistry"
          }
        ],
        "references": [
          {
            "service": "org.eclipse.edc.web.spi.WebServer",
            "required": true
          },
          {
            "service": "org.eclipse.edc.spi.types.TypeManager",
            "required": true
          }
        ],
        "configuration": [
          {
            "key": "edc.web.rest.cors.methods",
            "required": false,
            "type": "string",
            "description": "",
            "defaultValue": "",
            "deprecated": false
          }
          // other settings
        ],
        "name": "JerseyExtension",
        "type": "extension",
        "overview": null,
        "className": "org.eclipse.edc.web.jersey.JerseyExtension"
      }
    ],
    "extensionPoints": [],
    "modulePath": "org.eclipse.edc:jersey-core",
    "version": "0.8.2-SNAPSHOT",
    "name": null
  }
]
```

</details>

To achieve this, the [EDC Runtime Metamodel](https://github.com/eclipse-edc/Runtime-Metamodel) defines several
annotations. These are not required for compilation, but they should be added to the appropriate classes and fields with
proper attributes to enable good documentation. For detailed information please read [this chapter](../contributor-handbook.md#62-autodoc).

Note that `@Provider`, `@Inject`, `@Provides` and `@Requires` are used by Autodoc to resolve the dependency graph for
documentation, but they are also used by the runtime to resolve service dependencies. Read more about that
[here](./dependency-injection.md).

## 3. Configuration and best practices

One important task of extensions is to read and handle configuration. For this, the `ServiceExtensionContext` interface
provides the `getConfig()` group of methods.

Configuration values can be _optional_, i.e. they have a default value, or they can be _mandatory_, i.e. no default
value. Attempting to resolve a mandatory configuration value that was not specified will raise an `EdcException`.

EDC's configuration API can resolve configuration from three places, in this order:

1. from a `ConfigurationExtension`: this is a special extension class that provides a `Config` object. EDC ships with a
   file-system based config extension.
2. from environment variables: `edc.someconfig.someval` would map to `EDC_SOMECONFIG_SOMEVAL`
3. from Java `Properties`: can be passed in through CLI arguments, e.g. `-Dedc.someconfig.someval=...`

Best practices when handling configuration:

- resolve early, fail fast: configuration values should be resolved and validated as early as possible in the
  extension's `initialize()` method.
- don't pass the context: it is a code smell if the `ServiceExtensionContext` is passed into a service to resolve config
- annotate: every setting should have a `@Setting` annotation
- no magic defaults: default values should be declard as constants in the extension class and documented in the
  `@Setting` annotation.
- no secrets: configuration is the wrong place to store secrets
- naming convention: every config value should start with `edc.`
