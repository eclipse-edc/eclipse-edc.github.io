# Runtime-Core Repository

## Decision

The `Runtime-Metamodel` repository will be expanded and renamed to `Runtime-Core`, consolidating the following:

- The existing content of `Runtime-Metamodel` (annotations and classes used by the autodoc-processor)
- The `autodoc-processor` module, moved from the `GradlePlugins` repository
- The runtime bootstrap modules from the `Connector` repository (e.g. `boot`, dependency injection framework, and
  other domain-agnostic infrastructure modules)

The `GradlePlugins` repository will retain only `edc-build`, and will be **excluded from the platform release**, since
`edc-build` follows its own release cycle and is published on the Gradle Plugins Portal.

## Rationale

`Runtime-Metamodel` is an _anemic_ repository: it contains only annotations and a few classes, the latter of which
are exclusively used by the `autodoc-processor`. Since `autodoc-processor` is strictly dependent on `runtime-metamodel`,
co-locating them in the same repository removes an artificial boundary with no structural benefit.

Similarly, the runtime bootstrap modules currently scattered across the `Connector` repository are foundational
infrastructure that is not domain-specific. Grouping them with the metamodel and the autodoc-processor creates a
cohesive set of cross-cutting concerns under a single repository:

- **Faster platform releases**: one fewer repository in the platform release cycle.
- **Reduced coupling**: `IdentityHub` currently depends on the `Connector` repository partly because of these
  foundational runtime modules. Moving them to `Runtime-Core` allows `IdentityHub` (and other repositories) to depend
  only on `Runtime-Core` for runtime setup, removing the indirect dependency on `Connector`.
- **Clearer boundaries**: `Connector`, `IdentityHub`, and the `Technology` repositories become purely domain-focused;
  `Runtime-Core` owns everything needed to stand up an EDC runtime.

## Approach

The migration will be carried out in the following steps:

1. **Move `autodoc-processor`** from `GradlePlugins` into `Runtime-Metamodel`.
2. **Adapt release workflows**: remove `GradlePlugins` from the platform release; `edc-build` will continue to be
      released independently via the Gradle Plugins Portal.
3. **Move runtime bootstrap modules** (`boot`, dependency injection framework, and related domain-agnostic
   infrastructure) from the `Connector` repository into `Runtime-Metamodel`.
4. **Rename `Runtime-Metamodel`** to `Runtime-Core`.

### Versioning and Release Cycle

`Runtime-Core` will follow the same release cadence as the rest of the EDC platform. `GradlePlugins` (`edc-build`)
will continue to follow its own independent release cycle.

