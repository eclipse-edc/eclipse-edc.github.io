---
title: Json LD
weight: 10
---

<!-- TOC -->

- [JSON-LD in EDC](#1-json-ld-in-edc)
  - [1. JSON-LD in EDC](#1-json-ld-in-edc)
  - [1.1 Compact IRI](#11-compact-iri)
  - [1.2 Custom Remote Context](#12-custom-remote-context) \* [1.1 JSON-LD Validation](#11-json-ld-validation)
  <!-- TOC -->

Here is a simple example taken from [json-ld.org](https://json-ld.org)

```json
{
  "@context": "https://json-ld.org/contexts/person.jsonld",
  "@id": "http://dbpedia.org/resource/John_Lennon",
  "name": "John Lennon",
  "born": "1940-10-09",
  "spouse": "http://dbpedia.org/resource/Cynthia_Lennon"
}
```

It's similar on how a `Person` would be represented in JSON, with additional known properties such as `@context` and
`@id`.

The `@id` is used to uniquely identify an object.

The `@context` is used to define how [terms](https://www.w3.org/TR/json-ld/#dfn-term) should be interpreted and help
expressing specific identifier with short-hand names instead
of [IRI](https://datatracker.ietf.org/doc/html/rfc3987#section-2).

> Exhausting reserved keywords list and their meaning is
> available [here](https://www.w3.org/TR/json-ld11/#syntax-tokens-and-keywords)

In the above example the `@context` is a remote one, but the `@context` can also be defined inline. Here is the same
JSON-LD object using locally defined terms.

```json
{
  "@context": {
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "name": "http://xmlns.com/foaf/0.1/name",
    "born": {
      "@id": "http://schema.org/birthDate",
      "@type": "xsd:date"
    },
    "spouse": {
      "@id": "http://schema.org/spouse",
      "@type": "@id"
    }
  },
  "@id": "http://dbpedia.org/resource/John_Lennon",
  "name": "John Lennon",
  "born": "1940-10-09",
  "spouse": "http://dbpedia.org/resource/Cynthia_Lennon"
}
```

which defines inline the `name`, `born` and `spouse` terms.

> The two objects have the same meaning as Linked Data.

A JSON-LD document can be described in multiple [forms](https://www.w3.org/TR/json-ld/#forms-of-json-ld) and by applying
certain transformations a document can change shape without changing the meaning.

Relevant forms in the realm of EDC are:

- Expanded document form
- Compacted document form

The examples above are in `compacted` form and by applying
the [expansion](https://www.w3.org/TR/json-ld11-api/#expansion-algorithm) algorithm the output would look like this

```json
[
  {
    "@id": "http://dbpedia.org/resource/John_Lennon",
    "http://schema.org/birthDate": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#date",
        "@value": "1940-10-09"
      }
    ],
    "http://xmlns.com/foaf/0.1/name": [
      {
        "@value": "John Lennon"
      }
    ],
    "http://schema.org/spouse": [
      {
        "@id": "http://dbpedia.org/resource/Cynthia_Lennon"
      }
    ]
  }
]
```

The [expansion](https://www.w3.org/TR/json-ld11-api/#expansion-algorithm) is the process of taking in input a JSON-LD
document and applying the `@context` so that it is no longer necessary, as all the terms are resolved in their IRI
representation.

The [compaction](https://www.w3.org/TR/json-ld11-api/#compaction-algorithms) is the inverse process. It takes in input a
JSON-LD in expanded form and by applying the supplied `@context`, it creates the compacted form.

For playing around JSON-LD and processing algorithm the [playground](https://json-ld.org/playground/) is a useful tool.

## 1. JSON-LD in EDC

EDC uses JSON-LD as primary serialization format at API layer and at runtime EDC manages the objects in their expanded
form, for example when transforming `JsonObject` into EDC entities and and backwards
in [transformers](programming-primitives.md#2-transformers) or when [validating](#11-json-ld-validation) input
`JsonObject` at API level.

> Extensible properties in entities are always stored expanded form.

To achieve that, EDC uses an interceptor (`JerseyJsonLdInterceptor`) that always expands in ingress and compacts in
egress the `JsonObject`.

EDC uses JSON-LD for two main reasons:

Fist EDC embraces different protocols and standards such as:

- [dsp](https://docs.internationaldataspaces.org/ids-knowledgebase/v/dataspace-protocol)
- [odrl](https://www.w3.org/TR/odrl-vocab/)
- [dcat](https://www.w3.org/TR/vocab-dcat-2/)

and they all rely on JSON-LD as serialization format.

The second reason is that EDC allows to extends entities like `Asset` with custom properties, and uses JSON-LD as the
way to extend objects with custom namespaces.

EDC handles JSON-LD through the `JsonLd` SPI. It supports different operation and configuration for managing JSON-LD in
the EDC runtime.

It supports expansion and compaction process:

```java
  Result<JsonObject> expand(JsonObject json);

Result<JsonObject> compact(JsonObject json, String scope);
```

and allows the configuration of which `@context` and `namespaces` to use when processing the JSON-LD in a specific
scope.

For example when using the `JsonLd` service in the management API the `@context` and `namespaces` configured might
differs when using the same service in the `dsp` layer.

The `JsonLd` service also can configure cached contexts by allowing to have a local copy of the remote context. This
limits the network request required when processing the JSON-LD and reduces the attack surface if the remote host of the
context is compromised.

> By default EDC make usage of [`@vocab`](https://www.w3.org/TR/json-ld/#default-vocabulary) for processing input/output
> JSON-LD document. This can provide a default vocabulary for extensible properties. The remote context definition is
> available [on W3ID](https://w3id.org/edc/connector/management/v0.0.1).

Implementors that need additional `@context` and `namespaces` to be supported in EDC runtime, should develop a custom
extension that registers the required `@context` and `namespace`.

For example let's say we want to support a custom namespace `http://w3id.org/starwars/v0.0.1/ns/` in the extensible
properties of an [Asset](./entities.md#1-assets).

The input JSON would look like this:

```json
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
    "sw": "http://w3id.org/starwars/v0.0.1/ns/"
  },
  "@type": "Asset",
  "@id": "79d9c360-476b-47e8-8925-0ffbeba5aec2",
  "properties": {
    "sw:faction": "Galactic Imperium",
    "sw:person": {
      "sw:name": "Darth Vader",
      "sw:webpage": "https://death.star"
    }
  },
  "dataAddress": {
    "@type": "DataAddress",
    "type": "myType"
  }
}
```

Even if we don't register a any additional `@context` or `namespace` prefix in the EDC runtime,
the [Asset](./entities.md#1-assets) will still be persisted correctly since the JSON-LD gets expanded correctly and
stored in the expanded form.

But in the `egress` the JSON-LD document gets always compacted, and without additional configuration, it will look like
this:

```json
{
  "@id": "79d9c360-476b-47e8-8925-0ffbeba5aec2",
  "@type": "Asset",
  "properties": {
    "http://w3id.org/starwars/v0.0.1/ns/faction": "Galactic Imperium",
    "http://w3id.org/starwars/v0.0.1/ns/person": {
      "http://w3id.org/starwars/v0.0.1/ns/name": "Darth Vader",
      "http://w3id.org/starwars/v0.0.1/ns/webpage": "https://death.star"
    },
    "id": "79d9c360-476b-47e8-8925-0ffbeba5aec2"
  },
  "dataAddress": {
    "@type": "DataAddress",
    "type": "myType"
  },
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
    "edc": "https://w3id.org/edc/v0.0.1/ns/",
    "odrl": "http://www.w3.org/ns/odrl/2/"
  }
}
```

That means that the [IRIs](https://datatracker.ietf.org/doc/html/rfc3987#section-2) are not shortened to terms
or [compact iri](#11-compact-iri). This might be ok for some runtime and configuration. But if implementors want to
achieve more usability and easy of usage, two main strategy can be applied:

- [Compact IRI](#11-compact-iri)
- [Custom remote context](#12-custom-remote-context)

## 1.1 Compact IRI

The first strategy is to register a namespace prefix in an extension:

```java
public class MyExtension implements ServiceExtension {

    @Inject
    private JsonLd jsonLd;

    @Override
    public void initialize(ServiceExtensionContext context) {
        jsonLd.registerNamespace("sw", "http://w3id.org/starwars/v0.0.1/ns/", "MANAGEMENT_API");
    }
}
```

This will shorten the IRI to [compact IRI](https://www.w3.org/TR/json-ld11/#dfn-compact-iri) when compacting the same
JSON-LD:

```json
{
  "@id": "79d9c360-476b-47e8-8925-0ffbeba5aec2",
  "@type": "Asset",
  "properties": {
    "sw:faction": "Galactic Imperium",
    "sw:person": {
      "sw:name": "Darth Vader",
      "sw:webpage": "https://death.star"
    },
    "id": "79d9c360-476b-47e8-8925-0ffbeba5aec2"
  },
  "dataAddress": {
    "@type": "DataAddress",
    "type": "myType"
  },
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
    "edc": "https://w3id.org/edc/v0.0.1/ns/",
    "odrl": "http://www.w3.org/ns/odrl/2/",
    "sw": "http://w3id.org/starwars/v0.0.1/ns/"
  }
}
```

## 1.2 Custom Remote Context

An improved version requires developers to draft a context (which should be resolvable with an URL), for example
`http://w3id.org/starwars/context.jsonld`, that contains the terms definition.

An example of a definition might look like this:

```json
{
  "@context": {
    "@version": 1.1,
    "sw": "http://w3id.org/starwars/v0.0.1/ns/",
    "person": "sw:person",
    "faction": "sw:faction",
    "name": "sw:name",
    "webpage": "sw:name"
  }
}
```

Then in a an extension the context URL should be registered in the desired scope and cached:

```java
public class MyExtension implements ServiceExtension {

    @Inject
    private JsonLd jsonLd;

    @Override
    public void initialize(ServiceExtensionContext context) {
        jsonld.registerContext("http://w3id.org/starwars/context.jsonld", "MANAGEMENT_API");

        URI documentLocation = // load from filesystem or classpath
                jsonLdService.registerCachedDocument("http://w3id.org/starwars/context.jsonld", documentLocation)
    }
}
```

With this configuration the JSON-LD will be representend without the `sw` prefix, since the terms mapping is defined in
the remote context `http://w3id.org/starwars/context.jsonld`:

```json
{
  "@id": "79d9c360-476b-47e8-8925-0ffbeba5aec2",
  "@type": "Asset",
  "properties": {
    "faction": "Galactic Imperium",
    "person": {
      "name": "Darth Vader",
      "webpage": "https://death.star"
    },
    "id": "79d9c360-476b-47e8-8925-0ffbeba5aec2"
  },
  "dataAddress": {
    "@type": "DataAddress",
    "type": "myType"
  },
  "@context": [
    "http://w3id.org/starwars/context.jsonld",
    {
      "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
      "edc": "https://w3id.org/edc/v0.0.1/ns/",
      "odrl": "http://www.w3.org/ns/odrl/2/"
    }
  ]
}
```

> In case of name clash in the terms definition, the JSON-LD processor should fallback to
> the [compact URI](https://www.w3.org/TR/json-ld11/#dfn-compact-iri) representation.

### 1.1 JSON-LD Validation

EDC provides a mechanism to validate JSON-LD objects. The validation phase is typically handled at the
network/controller layer. For each entity identified by it's own `@type`, it is possible to register a custom
`Validator<JsonObject>` using the registry `JsonObjectValidatorRegistry`. By default EDC provides validation for all the
entities it manages like `Asset`, `ContractDefinition` ..etc.

For custom validator it is possible to either implements `Validator<JsonObject>` interface (not recommended) or
or use the bundled `JsonObjectValidator`, which is a declarative way of configuring a validator for an object through
the builder pattern. It also comes with a preset of validation rules such as id not empty, mandatory properties and many
more.

An example of validator for a custom type `Foo`:

```json
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
    "edc": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@id": "79d9c360-476b-47e8-8925-0ffbeba5aec2",
  "@type": "Foo",
  "bar": "value"
}
```

might look like this:

```java
public class FooValidator {

    public static JsonObjectValidator instance() {
        return JsonObjectValidator.newValidator()
                .verifyId(OptionalIdNotBlank::new)
                .verify("https://w3id.org/edc/v0.0.1/ns/bar")
                .build();
    }
}
```

and can be registered with the [@Injectable](../control-plane/dependency-injection.md#2-injecting-a-service)
`JsonObjectValidatorRegistry`:

```java
public class MyExtension implements ServiceExtension {

    @Inject
    private JsonObjectValidatorRegistry validator;

    @Override
    public void initialize(ServiceExtensionContext context) {

        validator.register("https://w3id.org/edc/v0.0.1/ns/Foo", FooValidator.instance());
    }
}
```

When needed, it can be invoked like this:

```java
public class MyController {

    private JsonObjectValidatorRegistry validator;

    @Override
    public void doSomething(JsonObject input) {
        validator.validate("https://w3id.org/edc/v0.0.1/ns/Foo", input)
                .orElseThrow(ValidationFailureException::new);
    }
}
```
