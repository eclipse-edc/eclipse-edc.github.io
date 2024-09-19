# Creation of Bills-of-Material (BOMs)

## Decision

The EDC project will Bill-of-Material (BOM) files with the goal of simplifying the creation of runtimes for downstream
projects. For example, creating a connector runtime should take no more an a couple of EDC dependencies.

## Rationale

The EDC project publishes a very large number of Java modules, most of which have to be declared as dependency
separately in downstream projects. So when developers want to create a custom EDC runtime (connector, catalog,
IdentityHub...) they have to create a large version catalog and - in the best of cases - declare `bundles` therein.

We can make this easier by providing a "runtime bom", that already pulls in all required dependencies.


## Approach

Each core component (Connector, FederatedCatalog, IdentityHub) provides one or more "runtime BOMs", which scaffold a
default runtime (in-mem stores and vaults, default services). In addition, each core component provides one or several
"feature pack BOMs" that add certain features, like SQL persistence, the Decentralized Claims Protocol stack, etc. 

### Connector

- `controlplane-base-bom`: base BOM that brings all the glue code to launch a controlplane runtime, including Management API, etc.
- `controlplane-dcp-bom`: builds on top of `connector-base`, adding DCP modules for DSP authentication (including LDP and JWT
  credentials, embedded STS). This creates a runnable controlplane runtime with DCP.
- `controlplane-oauth-bom`: builds on top of `connector-base`, adding OAuth2 modules for DSP authentication. This creates a
  runnable controlplane runtime with OAuth2.
- `controlplane-feature-vault-bom`: adds all required modules for the HashiCorp Vault implementation
- `controlplane-feature-sql-bom`: adds all controlplane SQL modules (transaction, connection pools, SQL store implementations).
  This BOM must be applied _in addition to_ the above ones.
- `dataplane-base-bom`: base BOM that creates a data plane runtime
- `dataplane-feature-sql-bom`: adds all dataplane SQL modules. This BOM must be applied _in addition to_ the above one
- `dataplane-feature-kafka-bom`: adds all modules required for a Kafka dataplane.
- `sts-feature-bom`: adds all modules required to embed a SecureTokenService in a runtime, for example in IdentityHub.
  Note that in that case the `RemoteSecureTokenService` (`identity-trust-sts-remote-client`) must be used on the client side.

### IdentityHub

- `identityhub-base-bom`: base BOM that brings all the glue code to launch a default IdentityHub runtime, including
  IdentityAPI API, Presentation API, etc.
- `identityhub-feature-sql-bom`: adds all modules required for SQL persistence. This BOM must be applied _in addition
  to_ the above one(s).

### FederatedCatalog

- `federatedcatalog-base-bom`: base BOM that brings all the glue code to launch a default FederatedCatalog runtime, including
  Query API, etc.
- `federatedcatalog-feature-sql-bom`: adds all modules required for SQL persistence. This BOM must be applied _in addition
  to_ the above one(s).

## An example

A typical use case could be to launch a Connector controlplane with DCP, SQL and HashiCorp Vault, using the remote STS
client. This would require a build file similar to this:

```kotlin
// yourproject/launcher/controlplane/build.gradle.kts

plugins{
    // ...
    id("application")
}

dependencies {
  runtimeOnly("org.eclipse.edc:controlplane-dcp-bom:X.Y.Z")
  runtimeOnly("org.eclipse.edc:controlplane-feature-sql-bom:X.Y.Z")
  runtimeOnly("org.eclipse.edc:controlplane-feature-vault-bom:X.Y.Z")
  runtimeOnly("org.eclipse.edc:identity-trust-sts-remote-client:X.Y.Z") // not a BOM!
  // ...
}

application {
    mainClass.set("org.eclipse.edc.boot.system.runtime.BaseRuntime")
}
```

## Additional considerations and notes

Technically, BOMs are just normal build files that contain dependencies in the `api` configuration. These build files
reside in a dedicated folder in the `dist` folder, e.g. `dist/bom/controlplane-base-bom/build.gradle.kts` and get
published as Maven artefacts just as a regular Java module would.

BOMs can depend on other BOMs, for exampe `controlplane-dcp-bom` would depend on `controlplane-base-bom`, adding only
DCP modules. We'll call those "incremental BOMs". 

Note that the type of BOM described here differes significantly from [Gradle platform
BOMs](https://docs.gradle.org/current/userguide/platforms.html#sub:using-platform-to-control-transitive-deps). Those are
intended to align transitive dependencies, and avoid version clashes in downstream projects. It may be advisable for a
_downstream project_ to declare a platform bom ("EDC version X works well with Nimbus version Y"), but it is not the
task of the EDC project or the goal of this Decision-Record. 
The BOMs described here merely shorten the dependency list needed by downstream projects.

While the `"-bom"` suffix may seem a bit clunky and spurious in this document, it will serve to clearly identify BOMs
when browsing EDC dependencies, and is a practice often observed when dealing with BOMs.

These BOMs are intended to fit a large number of use cases, but there will always be some for which this is not a
perfect fit. These cases can be covered by either declaring dependency exclusions or by simply using individual
dependencies.