---
title: Writing tests
weight: 40
---

<!-- TOC -->
  * [1. Adding EDC test fixtures](#1-adding-edc-test-fixtures)
  * [2. Controlling test verbosity](#2-controlling-test-verbosity)
  * [3. Definition and distinction](#3-definition-and-distinction)
    * [3.1 Coding Guidelines](#31-coding-guidelines)
  * [4. Integration Tests](#4-integration-tests)
    * [4.1 TL;DR](#41-tldr)
    * [4.2 When to use them](#42-when-to-use-them)
    * [4.4 Running integration tests locally](#44-running-integration-tests-locally)
    * [4.5 Running them in the CI pipeline](#45-running-them-in-the-ci-pipeline)
    * [4.6 Do's and Don'ts](#46-dos-and-donts)
  * [5. System tests](#5-system-tests)
    * [5.1 Running an EDC instance from a JUnit test](#51-running-an-edc-instance-from-a-junit-test)
    * [5.2 Solve potential port conflict issues with Testcontainers](#52-solve-potential-port-conflict-issues-with-testcontainers)
<!-- TOC -->

## 1. Adding EDC test fixtures

To add EDC test utilities and test fixtures to downstream projects, simply add the following Gradle dependency:

```kotlin
  testImplementation("org.eclipse.edc:junit:<version>")
```

## 2. Controlling test verbosity

To run tests verbosely (displaying test events and output and error streams to the console), use the following system
property:

```shell
./gradlew test -PverboseTest
```

## 3. Definition and distinction

* _unit tests_ test one single class by stubbing or mocking dependencies.
* [_integration test_](#4-integration-tests) tests one particular aspect of a software, which may involve external
  systems.
* [_system tests_](#5-system-tests) are end-to-end tests that rely on the _entire_ system to be present.

### 3.1 Coding Guidelines

The EDC codebase has few annotations and these annotation focuses on two important aspects:

- Exclude integration tests by default from JUnit test runner, as these tests relies on external systems which might not
  be available during a local execution.
- Categorize integration tests with help of [JUnit
  Tags](https://junit.org/junit5/docs/current/user-guide/#writing-tests-tagging-and-filtering).

Following are some available annotations:

- `@IntegrationTest`: Marks an integration test with `IntegrationTest` Junit tag. This is the default tag and can be
  used if you do not want to specify any other tags on your test to do further categorization.

Below annotations are used to categorize integration tests based on the runtime components that must be available for
the test to run. All of these annotations are composite annotations and contains `@IntegrationTest` annotation as well.

- `@ApiTest`: marks an integration test that focuses on testing a REST API. To do that, a runtime the controller class
  with all its collaborators is spun up.
- `@EndToEndTest`: Marks an integration test with `EndToEndTest` Junit Tag. This should be used when entire system is
- involved in a test.
- `@ComponentTest`: Marks an integration test with `ComponentTest` Junit Tag. This should be used when the test does not
  use any external systems, but uses actual collaborator objects instead of mocks.
- there are other more specific tags for cloud-vendor specific environments, like `@AzureStorageIntegrationTest` or
  `@AwsS3IntegrationTest`. Some of those environments can be emulated (with test containers), others can't.

We encourage you to use these available annotation but if your integration test does not fit in one of these available
annotations, and you want to categorize them based on their technologies then feel free to create a new annotations but
make sure to use composite annotations which contains `@IntegrationTest`. If you do not wish to categorize based on
their technologies then you can use already available `@IntegrationTest` annotation.

- By default, JUnit test runner ignores all integration tests because in root `build.gradle.kts` file we have excluded
  all tests marked with `IntegrationTest` Junit tag.
- If your integration test does not rely on an external system then you may not want to use above-mentioned annotations.

All integration tests should specify annotation to categorize them and the `"...IntegrationTest"` postfix to distinguish
them clearly from unit tests. They should reside in the same package as unit tests because all tests should maintain
package consistency to their test subject.

Any credentials, secrets, passwords, etc. that are required by the integration tests should be passed in using
environment variables. A good way to access them is `ConfigurationFunctions.propOrEnv()` because then the credentials
can also be supplied via system properties.

There is no one-size-fits-all guideline whether to perform setup tasks in the `@BeforeAll` or `@BeforeEach`, it will
depend on the concrete system you're using. As a general rule of thumb long-running one-time setup should be done in the
`@BeforeAll` so as not to extend the run-time of the test unnecessarily. In contrast, in most cases it is **not**
advisable to deploy/provision the external system itself in either one of those methods. In other words, manually
provisioning a cloud resource should generally be avoided, because it will introduce code that has nothing to do with
the test and may cause security problems.

If possible all external system should be deployed using [Testcontainers](https://testcontainers.com/). Alternatively,
in special situations there might be a dedicated test instance running continuously, e.g. a cloud-based database test
instance. In the latter case please be careful to avoid conflicts (e.g. database names) when multiple test runners
access that system simultaneously and to properly clean up any residue before and after the test.

## 4. Integration Tests

### 4.1 TL;DR

Use integration tests only when necessary, keep them concise, implement them in a defensive manner using timeouts and
randomized names, use test containers for external systems wherever possible. This increases portability.

### 4.2 When to use them

Generally speaking developers should favor writing unit tests over integration tests, because they are simpler, more
stable and typically run faster. Sometimes that is not (easily) possible, especially when an implementation relies on an
external system that is not easily mocked or stubbed such as databases.

Therefore, in many cases writing unit tests is more involved that writing an integration test, for example say you want
to test your implementation of a Postgres-backed database. You would have to mock the behaviour of the PostgreSQL
database, which - while certainly possible - can get complicated pretty quickly. You might still choose to do that for
simpler scenarios, but eventually you will probably want to write an integration test that uses an _actual_ PostgreSQL
instance.

### 4.4 Running integration tests locally

As mentioned above the JUnit runner won't pick up integration tests unless a tag is provided. For example to run `Azure
CosmosDB` integration tests pass `includeTags` parameter with tag value to the `gradlew` command:

```bash
./gradlew test -p path/to/module -DincludeTags="PostgresqlIntegrationTest"
```

running _all_ tests (unit & integration) can be achieved by passing the `runAllTests=true` parameter to the `gradlew`
command:

```bash
./gradlew test -DrunAllTests="true"
```

### 4.5 Running them in the CI pipeline

All integration tests should go into the [`verify.yaml` workflow](/.github/workflows/verify.yaml), every "technology"
should
have its own job, and technology specific tests can be targeted using Junit tags with `-DincludeTags` property as
described above in document.

A GitHub [composite action](https://docs.github.com/actions/creating-actions/creating-a-composite-action) was created to
encapsulate the tasks of setting up Java/Gradle and running tests.

For example let's assume we've implemented a PostgreSQL-based store for `SomeObject`, and let's assume that the
`verify.yaml` already contains a "Postgres" job, then every module that contains a test class annotated with
`@PostgresqlIntegrationTest` will be loaded and executed here. This tagging will be used by the CI pipeline step to
target and execute the integration tests related to Postgres.

Let's also make sure that the code is checked out before and integration tests only run on the upstream repo.

```yaml
jobs:
  Postgres-Integration-Tests:
    # run only on upstream repo
    if: github.repository_owner == 'eclipse-edc'
    runs-on: ubuntu-latest

    # taken from https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers
    services:
      # Label used to access the service container
      postgres:
        # Docker Hub image
        image: postgres
        # Provide the password for postgres
        env:
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}

    steps:
      - uses: ./.github/actions/setup-build

      - name: Postgres Tests
        uses: ./.github/actions/run-tests
        with:
          command: ./gradlew test -DincludeTags="PostgresIntegrationTest"

  [ ... ]
```

### 4.6 Do's and Don'ts

DO:

- aim to cover as many test cases with unit tests as possible
- use integration tests sparingly and only when unit tests are not practical
- deploy the external system test container if possible, or
- use a dedicated always-on test instance (esp. cloud resources)
- take into account that external systems might experience transient failures or have degraded performance, so test
  methods should have a timeout so as not to block the runner indefinitely.
- use randomized strings for things like database/table/bucket/container names, etc., especially when the external
  system does not get destroyed after the test.


DO NOT:

- try to cover everything with integration tests. It's typically a code smell if there are no corresponding unit tests
  for an integration test.
- slip into a habit of testing the external system rather than your usage of it
- store secrets directly in the code. GitHub will warn about that.
- perform complex external system setup in `@BeforeEach` or `@BeforeAll`
- add production code that is only ever used from tests. A typical smell are `protected` or `package-private` methods.

## 5. System tests

System tests are test in which an EDC runtime runs in the JUnit process.
To benefit from some fixtures that targets the management api, a 
[test fixtures module is available](https://central.sonatype.com/artifact/org.eclipse.edc/management-api-test-fixtures)
it can be added as a dependency:

```kotlin
testImplementation(testFixtures("org.eclipse.edc:management-api-test-fixtures:<version>"))
```

### 5.1 Running an EDC instance from a JUnit test

In some circumstances it is necessary to launch an EDC runtime and execute tests against it. This could be a
fully-fledged connector runtime, replete with persistence and all bells and whistles, or this could be a partial runtime
that contains lots of mocks and stubs. One prominent example of this is API tests. At some point, you'll want to run
REST requests using a HTTP client against the _actual_ EDC runtime, using JSON-LD expansion, transformation etc. and
real database infrastructure.

EDC provides a nifty way to launch any runtime from within the JUnit process, which makes it easy to configure and debug
not only the actual test code, but also the system-under-test, i.e. the runtime.

To do that, two parts are needed:

- a _runner_: a module that contains the test logic
- one or several _runtimes_: one or more modules that define a standalone runtime (e.g. a runnable EDC definition)

The runner can load an EDC runtime by using the `@RegisterExtension` annotation:

```java

@EndToEndTest
class YourEndToEndTest {

    @RegisterExtension
    private final RuntimeExtension controlPlane = new RuntimePerClassExtension(new EmbeddedRuntime(
            "control-plane", // the runtime's name, used for log output
            // all modules to be put on the runtime classpath
            ":core:common:connector-core",
            ":core:control-plane:control-plane-core",
            ":core:data-plane-selector:data-plane-selector-core",
            ":extensions:control-plane:transfer:transfer-data-plane-signaling",
            ":extensions:common:iam:iam-mock",
            ":extensions:common:http",
            ":extensions:common:api:control-api-configuration")
            // the runtime configuration is passed through a lazy provider
            .configurationProvider(() -> ConfigFactory.fromMap(Map.of(
                    "web.http.control.port", String.valueOf(getFreePort()),
                    "web.http.control.path", "/control"))
            )
    );
    
}
```

This example will launch a runtime called `"control-plane"`, add the listed Gradle modules to its classpath and pass the
configuration as map to it. And it does that _from within the JUnit process_, so the `"control-plane"` runtime can be
debugged from the IDE.

The example above will initialize and start the runtime once, before all tests run (hence the name
"Runtime**PerClass**Extension"). Alternatively, there is the `RuntimePerMethodExtension` which will re-initialize and
start the runtime before _every_ test method.

In most use cases, `RuntimePerClassExtension` is preferable, because it avoids having to start the runtime on every
test. There are cases, where the `RuntimePerMethodExtension` is useful, for example when the runtime is mutated during
tests and cleaning up data stores is not practical. Be aware of the added test execution time penalty though.

To make sure that the runtime extensions are correctly built and available, they need to be set as dependency of the
runner module as `testCompileOnly`.

This ensures proper dependency isolation between runtimes (very important the test need to run two different components
like a control plane and a data plane).

Technically, the number of runtimes launched that way is not limited (other than by host system resource), so
theoretically, an entire dataspace with N participants could be launched that way...

### 5.2 Solve potential port conflict issues with Testcontainers

Using Testcontainers in the system tests could lead to port conflicts, especially if the ports generated randomly to be
used in the EDC runtimes are created statically before the Testcontainers instances are spin up.

To solve this problem it's good to follow the "lazy configuration" practice:
- generate the random ports in the `configurationProvider` that's passed to the `EmbeddedRuntime`, it will ensure that
  the port number is assigned lazily right before the runtime startup
- if a port is also needed to be configured in another runtime (e.g. to permit communication on that port by the other
  runtime, it can be instantiated lazily using the `LazySupplier` as shown in the example:

```java
@EndToEndTest
class YourEndToEndTest {

    private final LazySupplier<Integer> port = new LazySupplier<>(Ports::getFreePort);

    @RegisterExtension
    private final RuntimeExtension connector = new RuntimePerClassExtension(new EmbeddedRuntime(
            "connector",
            ":runtime")
            .configurationProvider(() -> ConfigFactory.fromMap(Map.of(
                    // port will be lazily instantiated here...
                    "web.http.port", String.valueOf(port.get())
            ))
        )
    );

    @RegisterExtension
    private final RuntimeExtension anotherConnector = new RuntimePerClassExtension(new EmbeddedRuntime(
            "connector",
            ":runtime")
            .configurationProvider(() -> ConfigFactory.fromMap(Map.of(
                    // ... or it could be instantiated lazily here!
                    "connector.port", String.valueOf(port.get())
            ))
        )
    );
}
```
