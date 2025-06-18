---
title: Testing
description: Covers how to use EDC test runtimes.
weight: 100
---

EDC provides a JUnit test fixture for running automated integration tests. The EDC JUnit runtime offers a number of advantages:

- Fast build time since container images do not need to be built and deployed
- Launch and debug tests directly within an IDE
- Easily write asynchronous tests using libraries such as [Awaitility](http://www.awaitility.org/)

The JUnit runtime can be configured to include custom extensions. Running multiple instances as part of a single test setup is also possible. The following demonstrates how to set up and launch a basic test using JUnit's `RegisterExtension` annotation and the `RuntimePerClassExtension`:

```java
@EndToEndTest
class Basic01basicConnectorTest {

    @RegisterExtension
    static RuntimeExtension connector = new RuntimePerClassExtension(new EmbeddedRuntime(
            "connector",
            emptyMap(),
            ":basic:basic-01-basic-connector"
    ));

    @Test
    void shouldStartConnector() {
        assertThat(connector.getService(Clock.class)).isNotNull();
    }
}
```

For more details and examples, check out the [EDC Samples system tests](https://github.com/eclipse-edc/Samples/tree/main/system-tests).
