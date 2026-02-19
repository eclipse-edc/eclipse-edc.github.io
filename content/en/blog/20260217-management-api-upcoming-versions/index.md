---
title: Management API upcoming versions
date: 2026-02-19
description: >
  In the forthcoming weeks we'll see new Management API versions coming
---

The current, stable Management API of EDC Connector version 3 has served well during the last 2 years, but changes in the underlying protocols and the solidification of the EDC-V concept demand new versions.

## Rationale

There will be 2 new Management API version releases.

### Version 4
Version 4, which is already in its beta phase (as you can check in the [OpenAPI documentation](https://eclipse-edc.github.io/Connector/openapi/management-api/), so you can test it out and provide feedback), has been introduced to better align with the [DSP 2025-1 spec](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/).

In that spec we can read:
> All protocol messages are normatively defined by a json-schema. This specification also uses JSON-LD 1.1 and provides a JSON-LD context to serialize data structures and Message types as it facilitates extensibility. The JSON-LD context is designed to produce Message serializations using compaction that validate against the JSON Schema for the given Message type. This allows implementations to choose whether to process messages as plain JSON or as JSON-LD and maintain interoperability between those approaches.

This means that, despite the adoption of JSON-LD as done in the earliest versions of DSP, the specification describes
the payloads with json schema documents, with the goal to have more tidy and simple messages and to avoid falling into
the JSON-LD complexity.

JSON-LD is still there under the hood; in fact the way these messages can be expanded is described by the proper `@context`, so the semantic approach will be maintained.

EDC is going to follow the same approach: all the JSON payloads in the Management API will be described and validated
by json schema documents.
For example, here's the `TransferRequest` type one: [schema](https://w3id.org/edc/connector/management/schema/v4/transfer-request-schema.json).
EDC already provides a common JSON-LD context that can be used, e.g.
```json
{
  "@context": "https://w3id.org/edc/connector/management/v2",
  "@type": "TransferRequest",
  "@id": "<uuid>",
  ...
}
```

The advantages of this approach are that those who need to use additional contexts to provide further semantics can do so, and also provide additional validation by just registering the related json schema file.
Plus, client implementation will be much easier.

### Version 5

Version 5 of the Management API will be pretty much the same as version 4 schema-wise, the only major change
will be in the path of the API: since the [Virtual Connector](https://github.com/eclipse-edc/Virtual-Connector) will introduce the possibility to support multiple participants in the same runtime, the endpoint will need to contain the `participantContextId`, so an endpoint like `/v4/assets/request` could (just speculation, the format hasn't been decided yet) become `/v5/<participantContextId>/assets/request`

## Approach

The current plan is to promote `v4` to `stable` with EDC release `v0.17.0` and deprecate `v3` at the same moment. Then `v3` will be removed sometime after 3 months from the deprecation as stated in the ["deprecation rules"](https://github.com/eclipse-edc/eclipse-edc.github.io/tree/7a303030ac2c51c4741c03776d296bd2c80210b6/developer/decision-records/2024-05-27-maturity-levels-deprecation-policy).

At the moment there is no plan for `v5` release.