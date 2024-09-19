# Consistent Versioning of external APIs (cont'd)

_This Decision Record is an Addendum
to [2023-11-09-api-versioning](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2023-11-09-api-versioning)
and builds partly
on [2022-11-09-api-refactoring](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2022-11-09-api-refactoring).
All statements made there remain valid here, unless stated otherwise_.

## Decision

All Eclipse Dataspace Components that expose an API must adhere to the rules outlined in this document how APIs are
grouped and how versions are made available at runtime.

## Rationale

As the EDC project matures, the number of APIs it exposes will grow. Its interrelated components have multiple
APIs each, all of which fulfill different objectives, have different with regard to security, network protection and
authentication/authorization.

_Note: this solely refers to remote APIs, e.g. REST, not code-level interfaces. We typically call those "SPIs"._

## Approach

### Grouping of APIs

This section outlines the different groups (or "contexts") of APIs that currently exist in the Connector project, with
the notable exclusions of DSP.

1. the `"management"` context: contains all endpoints that allow manipulating the business objects of EDC, such as
   Assets, Policies etc. This API is not intended for internet-facing deployments, and
   requires [additional protection](../../best-practices.md#11-exposing-apis-to-the-internet).
2. the `"observability"` context: contains the Observability endpoints that are intended to track the application health
   in containerized deployments, similar
   to [Kubernetes readiness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
   This API should not be exposed outside the container/pod. This is currently located under the `"default"` context.
3. the `"control"` context: contains endpoints that are designed for component-to-component interaction, for
   example [Data Plane Signaling](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2023-12-12-dataplane-signaling)
   between control plane and data plane. These APIs are not intended to be exposed to the internet or consumed by third-party applications.
4. the `"public"` context: this is the public-facing endpoint(s) exposed by the dataplane for HTTP-PULL transfers.
5. the `"sts"` context: the endpoints that are exposed by the Secure Token Service
6. the `"version"` context: contains the endpoint to access version information,
   see [below](#accessing-versioning-information) for details.

Every API group (or "context") has its own version, but all of them adhere to the same versioning scheme: all endpoints
of one particular group are reachable using the same base path, including the version segment (
e.g. `/api/management/v4/...`).
As stated in
the [predecessor D-R](https://github.com/eclipse-edc/Connector/tree/main/docs/developer/decision-records/2023-11-09-api-versioning),
URL path only contains major versions, prefixed with a "v", e.g. `"/v3", "/v4".`

_Note that although this decision record only mentions APIs of the connector, the assertions and statements hold true for
other components as well. APIs of other components, even if their semantics are similar (e.g. "IdentityHub Management API"), are
technically treated as separate groups/contexts._

### Accessing versioning information

A new `"version"` context will be introduced that contains the Version Information API. The purpose of this API is to
provide version information about each API that is deployed in the current runtime. With a simple `GET` request users
can obtain that information:

```shell
GET /api/version/v1/
```

returns a response like the following:

```json
{
   "management": [
      {
         "version": "3.0.0",
         "urlPath": "/v3",
         "lastUpdated": "2024-05-20T14:02:41Z"
      },
      {
         "version": "2.0.4",
         "urlPath": "/v2",
         "lastUpdated": "2023-06-18T18:00:00Z"
      }
   ],
   "control": [
      {
         "version": "1.0.2",
         "urlPath": "/v1",
         "lastUpdated": "2023-01-01T12:00:00Z"
      }
   ],
   "version": [
      {
         "version": "1.0.0",
         "urlPath": "/v1",
         "lastUpdated": "2024-05-20T00:00:00Z"
      }
   ]
}
```

Every API group that is present in the current runtime, including the `"version"` context with the Version Information
API, is represented in the response.

The service implementation of this feature will follow a similar approach as the health status providers: every API
group contributes a version record into a central directory, which is then exposed via the aforementioned API.

#### Version record schema

```java
public record VersionRecord(String version, String urlPath, Instant lastUpdated) {
}
```

Note that `lastUpdated` refers to the time when the developer bumped the version. This will likely have to be done manually.

### Runtime view of APIs

From a runtime perspective, we will keep all versions of an API in the _same_ Java module (as opposed to: in separate
modules). That way it can be ensured that all available versions of an API are accessible at runtime.

### Further considerations

- controller `@Path` annotations should **include** the version string, e.g. `@Path("/v4/assets")`
- context configurations in properties files should **not** include versions