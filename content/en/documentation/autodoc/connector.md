---
 title: Connector
 weight: 10
---

Module `accesstokendata-store-sql`
----------------------------------
**Artifact:** org.eclipse.edc:accesstokendata-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.store.sql.SqlAccessTokenDataStoreExtension`
**Name:** "Sql AccessTokenData Store"

**Overview:**  Provides Sql Store for {@link AccessTokenData} objects



### Configuration

| Key                                        | Required | Type     | Default   | Pattern | Min | Max | Description |
| ------------------------------------------ | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.accesstokendata.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.spi.store.AccessTokenDataStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.dataplane.store.sql.schema.AccessTokenDataStatements` (optional)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `api-core`
-----------------
**Artifact:** org.eclipse.edc:api-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.ApiCoreDefaultServicesExtension`
**Name:** "ApiCoreDefaultServicesExtension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry`
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationProviderRegistry`

#### Referenced (injected) services
_None_

#### Class: `org.eclipse.edc.api.ApiCoreExtension`
**Name:** "API Core"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

Module `api-observability`
--------------------------
**Artifact:** org.eclipse.edc:api-observability:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.observability.ObservabilityApiExtension`
**Name:** "Observability API"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.spi.system.health.HealthCheckService` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService` (required)

Module `asset-api`
------------------
**Artifact:** org.eclipse.edc:asset-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.asset.AssetApiExtension`
**Name:** "Management API: Asset"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.asset.AssetService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)

Module `asset-index-sql`
------------------------
**Artifact:** org.eclipse.edc:asset-index-sql:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.store.sql.assetindex.schema.AssetStatements`

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.store.sql.assetindex.SqlAssetIndexServiceExtension`
**Name:** "SQL asset index"

**Overview:** No overview provided.


### Configuration

| Key                              | Required | Type     | Default   | Pattern | Min | Max | Description |
| -------------------------------- | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.asset.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.asset.spi.index.AssetIndex`
- `org.eclipse.edc.connector.controlplane.asset.spi.index.DataAddressResolver`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.controlplane.store.sql.assetindex.schema.AssetStatements` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `auth-configuration`
---------------------------
**Artifact:** org.eclipse.edc:auth-configuration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.auth.configuration.ApiAuthenticationConfigurationExtension`
**Name:** "Api Authentication Configuration Extension"

**Overview:** No overview provided.


### Configuration

| Key                               | Required | Type     | Default | Pattern | Min | Max | Description                                                                     |
| --------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ------------------------------------------------------------------------------- |
| `web.http.<context>.auth.type`    | `*`      | `string` | ``      |         |     |     | The type of the authentication provider.                                        |
| `web.http.<context>.auth.context` | `*`      | `string` | ``      |         |     |     | The api context where to apply the authentication. Default to the web <context> |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationProviderRegistry` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry` (required)
- `org.eclipse.edc.web.spi.WebService` (required)

Module `auth-delegated`
-----------------------
**Artifact:** org.eclipse.edc:auth-delegated:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.auth.delegated.DelegatedAuthenticationExtension`
**Name:** "Delegating Authentication Service Extension"

**Overview:**  Extension that registers an AuthenticationService that delegates authentication and authorization to a third-party IdP
 and register an {@link ApiAuthenticationProvider} under the type called delegated



### Configuration

| Key                                          | Required | Type     | Default  | Pattern | Min | Max | Description |
| -------------------------------------------- | -------- | -------- | -------- | ------- | --- | --- | ----------- |
| ~~edc.api.auth.dac.cache.validity~~          |          | `string` | `300000` |         |     |     |             |
| ~~edc.api.auth.dac.key.url~~                 |          | `string` | ``       |         |     |     |             |
| `web.http.<context>.auth.dac.key.url`        | `*`      | `string` | ``       |         |     |     |             |
| `web.http.<context>.auth.dac.cache.validity` | `*`      | `Long`   | `300000` |         |     |     |             |
| `edc.api.auth.dac.validation.tolerance`      | `*`      | `string` | `5000`   |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationProviderRegistry` (required)
- `org.eclipse.edc.token.spi.TokenValidationRulesRegistry` (required)
- `org.eclipse.edc.keys.spi.KeyParserRegistry` (required)
- `org.eclipse.edc.token.spi.TokenValidationService` (required)
- `java.time.Clock` (required)

Module `auth-spi`
-----------------
**Name:** Auth services
**Artifact:** org.eclipse.edc:auth-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.api.auth.spi.AuthenticationService`
  - `org.eclipse.edc.api.auth.spi.ApiAuthenticationProvider`
  - `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationProviderRegistry`

### Extensions
Module `auth-tokenbased`
------------------------
**Artifact:** org.eclipse.edc:auth-tokenbased:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.auth.token.TokenBasedAuthenticationExtension`
**Name:** "Static token API Authentication"

**Overview:**  Extension that registers an AuthenticationService that uses API Keys and register
 an {@link ApiAuthenticationProvider} under the type called tokenbased



### Configuration

| Key                                 | Required | Type     | Default | Pattern | Min | Max | Description                                      |
| ----------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ------------------------------------------------ |
| `web.http.<context>.auth.key`       | `*`      | `string` | ``      |         |     |     | The api key to use for the <context>             |
| `web.http.<context>.auth.key.alias` | `*`      | `string` | ``      |         |     |     | The vault api key alias to use for the <context> |
| ~~edc.api.auth.key~~                | `*`      | `string` | ``      |         |     |     |                                                  |
| ~~edc.api.auth.key.alias~~          | `*`      | `string` | ``      |         |     |     |                                                  |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationProviderRegistry` (required)

Module `boot`
-------------
**Artifact:** org.eclipse.edc:boot:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.boot.BootServicesExtension`
**Name:** "Boot Services"

**Overview:** No overview provided.


### Configuration

| Key                  | Required | Type     | Default         | Pattern | Min | Max | Description |
| -------------------- | -------- | -------- | --------------- | ------- | --- | --- | ----------- |
| `edc.participant.id` | `*`      | `string` | ``              |         |     |     |             |
| `edc.runtime.id`     | `*`      | `string` | `<random UUID>` |         |     |     |             |
| `edc.component.id`   | `*`      | `string` | `<random UUID>` |         |     |     |             |

#### Provided services
- `java.time.Clock`
- `org.eclipse.edc.spi.telemetry.Telemetry`
- `org.eclipse.edc.spi.system.health.HealthCheckService`
- `org.eclipse.edc.spi.security.Vault`
- `org.eclipse.edc.spi.system.ExecutorInstrumentation`
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService`

#### Referenced (injected) services
_None_

Module `callback-event-dispatcher`
----------------------------------
**Artifact:** org.eclipse.edc:callback-event-dispatcher:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.callback.dispatcher.CallbackEventDispatcherExtension`
**Name:** "Callback dispatcher extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.services.spi.callback.CallbackProtocolResolverRegistry`

#### Referenced (injected) services
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry` (required)
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.callback.CallbackRegistry` (required)

Module `callback-http-dispatcher`
---------------------------------
**Artifact:** org.eclipse.edc:callback-http-dispatcher:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.callback.dispatcher.http.CallbackEventDispatcherHttpExtension`
**Name:** "Callback dispatcher http extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.callback.CallbackProtocolResolverRegistry` (required)
- `org.eclipse.edc.spi.security.Vault` (required)

Module `callback-static-endpoint`
---------------------------------
**Artifact:** org.eclipse.edc:callback-static-endpoint:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.callback.staticendpoint.CallbackStaticEndpointExtension`
**Name:** "Static callbacks extension"

**Overview:**  Extension for configuring the static endpoints for callbacks



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.services.spi.callback.CallbackRegistry` (required)

Module `catalog-api`
--------------------
**Artifact:** org.eclipse.edc:catalog-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.catalog.CatalogApiExtension`
**Name:** "Management API: Catalog"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.catalog.CatalogService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

Module `configuration-filesystem`
---------------------------------
**Artifact:** org.eclipse.edc:configuration-filesystem:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.configuration.filesystem.FsConfigurationExtension`
**Name:** "FS Configuration"

**Overview:**  Sources configuration values from a properties file.



### Configuration

| Key             | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.fs.config` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
_None_

Module `connector-core`
-----------------------
**Artifact:** org.eclipse.edc:connector-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.core.CoreServicesExtension`
**Name:** "Core Services"

**Overview:**  This extension provides default/standard implementations for the {@link PrivateKeyResolver} and the {@link CertificateResolver}
 Those provider methods CANNOT be implemented in {@link CoreDefaultServicesExtension}, because that could potentially cause
 a conflict with injecting/providing the {@link Vault}



### Configuration

| Key                      | Required | Type     | Default     | Pattern | Min | Max | Description |
| ------------------------ | -------- | -------- | ----------- | ------- | --- | --- | ----------- |
| `edc.agent.identity.key` | `*`      | `string` | `client_id` |         |     |     |             |
| `edc.hostname`           | `*`      | `string` | `localhost` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.spi.types.TypeManager`
- `org.eclipse.edc.spi.system.Hostname`
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry`
- `org.eclipse.edc.spi.command.CommandHandlerRegistry`
- `org.eclipse.edc.participant.spi.ParticipantAgentService`
- `org.eclipse.edc.policy.engine.spi.RuleBindingRegistry`
- `org.eclipse.edc.policy.engine.spi.PolicyEngine`
- `org.eclipse.edc.spi.event.EventRouter`
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry`
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry`
- `org.eclipse.edc.validator.spi.DataAddressValidatorRegistry`
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry`
- `org.eclipse.edc.http.spi.ControlApiHttpClient`

#### Referenced (injected) services
- `org.eclipse.edc.connector.core.event.EventExecutorServiceContainer` (required)
- `org.eclipse.edc.spi.types.TypeManager` (optional)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.api.auth.spi.ControlClientAuthenticationProvider` (required)

#### Class: `org.eclipse.edc.connector.core.CoreDefaultServicesExtension`
**Name:** "CoreDefaultServicesExtension"

**Overview:**  This extension provides default/standard implementations for the {@link PrivateKeyResolver} and the {@link CertificateResolver}
 Those provider methods CANNOT be implemented in {@link CoreDefaultServicesExtension}, because that could potentially cause
 a conflict with injecting/providing the {@link Vault}



### Configuration

| Key                                      | Required | Type     | Default | Pattern | Min | Max | Description |
| ---------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.http.client.https.enforce`          | `*`      | `string` | `false` |         |     |     |             |
| `edc.http.client.timeout.connect`        | `*`      | `string` | `30`    |         |     |     |             |
| `edc.http.client.timeout.read`           | `*`      | `string` | `30`    |         |     |     |             |
| `edc.http.client.send.buffer.size`       | `*`      | `string` | `0`     |         |     |     |             |
| `edc.http.client.receive.buffer.size`    | `*`      | `string` | `0`     |         |     |     |             |
| `edc.core.retry.retries.max`             | `*`      | `string` | `5`     |         |     |     |             |
| `edc.core.retry.backoff.min`             | `*`      | `string` | `500`   |         |     |     |             |
| `edc.core.retry.backoff.max`             | `*`      | `string` | `10000` |         |     |     |             |
| `edc.core.retry.log.on.retry`            | `*`      | `string` | `false` |         |     |     |             |
| `edc.core.retry.log.on.retry.scheduled`  | `*`      | `string` | `false` |         |     |     |             |
| `edc.core.retry.log.on.retries.exceeded` | `*`      | `string` | `false` |         |     |     |             |
| `edc.core.retry.log.on.failed.attempt`   | `*`      | `string` | `false` |         |     |     |             |
| `edc.core.retry.log.on.abort`            | `*`      | `string` | `false` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.transaction.spi.TransactionContext`
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry`
- `org.eclipse.edc.connector.core.event.EventExecutorServiceContainer`
- `org.eclipse.edc.http.spi.EdcHttpClient`
- `org.eclipse.edc.api.auth.spi.ControlClientAuthenticationProvider`
- `okhttp3.OkHttpClient`
- `dev.failsafe.RetryPolicy<T>`
- `org.eclipse.edc.participant.spi.ParticipantIdMapper`

#### Referenced (injected) services
- `okhttp3.EventListener` (optional)

#### Class: `org.eclipse.edc.connector.core.LocalPublicKeyDefaultExtension`
**Name:** "Security Default Services Extension"

**Overview:**  This extension provides default/standard implementations for the {@link PrivateKeyResolver} and the {@link CertificateResolver}
 Those provider methods CANNOT be implemented in {@link CoreDefaultServicesExtension}, because that could potentially cause
 a conflict with injecting/providing the {@link Vault}



### Configuration

| Key                                  | Required | Type     | Default | Pattern | Min | Max | Description                                                                                                                                      |
| ------------------------------------ | -------- | -------- | ------- | ------- | --- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `edc.iam.publickeys.<pkAlias>.id`    | `*`      | `string` | ``      |         |     |     | ID of the public key.                                                                                                                            |
| `edc.iam.publickeys.<pkAlias>.value` | `*`      | `string` | ``      |         |     |     | Value of the public key. Multiple formats are supported, depending on the KeyParsers registered in the runtime                                   |
| `edc.iam.publickeys.<pkAlias>.path`  | `*`      | `string` | ``      |         |     |     | Path to a file that holds the public key, e.g. a PEM file. Multiple formats are supported, depending on the KeyParsers registered in the runtime |

#### Provided services
- `org.eclipse.edc.keys.spi.LocalPublicKeyService`

#### Referenced (injected) services
- `org.eclipse.edc.keys.spi.KeyParserRegistry` (required)
- `org.eclipse.edc.spi.security.Vault` (required)

#### Class: `org.eclipse.edc.connector.core.SecurityDefaultServicesExtension`
**Name:** "Security Default Services Extension"

**Overview:**  This extension provides default/standard implementations for the {@link PrivateKeyResolver} and the {@link CertificateResolver}
 Those provider methods CANNOT be implemented in {@link CoreDefaultServicesExtension}, because that could potentially cause
 a conflict with injecting/providing the {@link Vault}



### Configuration_None_

#### Provided services
- `org.eclipse.edc.keys.spi.PrivateKeyResolver`
- `org.eclipse.edc.keys.spi.CertificateResolver`
- `org.eclipse.edc.keys.spi.KeyParserRegistry`

#### Referenced (injected) services
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `contract-agreement-api`
-------------------------------
**Artifact:** org.eclipse.edc:contract-agreement-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.contractagreement.ContractAgreementApiExtension`
**Name:** "Management API: Contract Agreement"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.contractagreement.ContractAgreementService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)

Module `contract-definition-api`
--------------------------------
**Artifact:** org.eclipse.edc:contract-definition-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.contractdefinition.ContractDefinitionApiExtension`
**Name:** "Management API: Contract Definition"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.contractdefinition.ContractDefinitionService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

Module `contract-definition-store-sql`
--------------------------------------
**Artifact:** org.eclipse.edc:contract-definition-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.store.sql.contractdefinition.SqlContractDefinitionStoreExtension`
**Name:** "SQL contract definition store"

**Overview:** No overview provided.


### Configuration

| Key                                           | Required | Type     | Default   | Pattern | Min | Max | Description |
| --------------------------------------------- | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.contractdefinition.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.store.ContractDefinitionStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.controlplane.store.sql.contractdefinition.schema.ContractDefinitionStatements` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `contract-negotiation-api`
---------------------------------
**Artifact:** org.eclipse.edc:contract-negotiation-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.contractnegotiation.ContractNegotiationApiExtension`
**Name:** "Management API: Contract Negotiation"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.contractnegotiation.ContractNegotiationService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)

Module `contract-negotiation-store-sql`
---------------------------------------
**Artifact:** org.eclipse.edc:contract-negotiation-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.store.sql.contractnegotiation.SqlContractNegotiationStoreExtension`
**Name:** "SQL contract negotiation store"

**Overview:** No overview provided.


### Configuration

| Key                                            | Required | Type     | Default   | Pattern | Min | Max | Description |
| ---------------------------------------------- | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.contractnegotiation.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.connector.controlplane.store.sql.contractnegotiation.store.schema.ContractNegotiationStatements` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `contract-spi`
---------------------
**Name:** Contract services
**Artifact:** org.eclipse.edc:contract-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.contract.spi.validation.ContractValidationService`
  - `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.NegotiationWaitStrategy`
  - `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.observe.ContractNegotiationObservable`
  - `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore`
  - `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ConsumerContractNegotiationManager`
  - `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ProviderContractNegotiationManager`
  - `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ContractNegotiationPendingGuard`
  - `org.eclipse.edc.connector.controlplane.contract.spi.offer.store.ContractDefinitionStore`

### Extensions
Module `control-api-configuration`
----------------------------------
**Artifact:** org.eclipse.edc:control-api-configuration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.api.control.configuration.ControlApiConfigurationExtension`
**Name:** "Control API configuration"

**Overview:**  Tells all the Control API controllers under which context alias they need to register their resources: either
 `default` or `control`



### Configuration

| Key                     | Required | Type     | Default        | Pattern | Min | Max | Description |
| ----------------------- | -------- | -------- | -------------- | ------- | --- | --- | ----------- |
| `web.http.control.port` | `*`      | `string` | `9191`         |         |     |     |             |
| `web.http.control.path` | `*`      | `string` | `/api/control` |         |     |     |             |
| `edc.control.endpoint`  |          | `string` | ``             |         |     |     |             |

#### Provided services
- `org.eclipse.edc.web.spi.configuration.context.ControlApiUrl`

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.spi.system.Hostname` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry` (required)
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService` (required)

Module `control-plane-aggregate-services`
-----------------------------------------
**Artifact:** org.eclipse.edc:control-plane-aggregate-services:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.services.ControlPlaneServicesExtension`
**Name:** "Control Plane Services"

**Overview:** No overview provided.


### Configuration

| Key                             | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.policy.validation.enabled` | `*`      | `string` | `false` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.services.spi.asset.AssetService`
- `org.eclipse.edc.connector.spi.service.SecretService`
- `org.eclipse.edc.connector.controlplane.services.spi.catalog.CatalogService`
- `org.eclipse.edc.connector.controlplane.services.spi.catalog.CatalogProtocolService`
- `org.eclipse.edc.connector.controlplane.services.spi.contractagreement.ContractAgreementService`
- `org.eclipse.edc.connector.controlplane.services.spi.contractdefinition.ContractDefinitionService`
- `org.eclipse.edc.connector.controlplane.services.spi.contractnegotiation.ContractNegotiationService`
- `org.eclipse.edc.connector.controlplane.services.spi.contractnegotiation.ContractNegotiationProtocolService`
- `org.eclipse.edc.connector.controlplane.services.spi.policydefinition.PolicyDefinitionService`
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessService`
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessProtocolService`
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolTokenValidator`
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.VersionProtocolService`
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.VersionService`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry` (required)
- `org.eclipse.edc.connector.controlplane.asset.spi.index.AssetIndex` (required)
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.store.ContractDefinitionStore` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ConsumerContractNegotiationManager` (required)
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.TransferProcessManager` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.validation.ContractValidationService` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.ConsumerOfferResolver` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.observe.ContractNegotiationObservable` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.observe.TransferProcessObservable` (required)
- `org.eclipse.edc.spi.telemetry.Telemetry` (required)
- `org.eclipse.edc.participant.spi.ParticipantAgentService` (required)
- `org.eclipse.edc.connector.controlplane.catalog.spi.DataServiceRegistry` (required)
- `org.eclipse.edc.connector.controlplane.catalog.spi.DatasetResolver` (required)
- `org.eclipse.edc.spi.command.CommandHandlerRegistry` (required)
- `org.eclipse.edc.validator.spi.DataAddressValidatorRegistry` (required)
- `org.eclipse.edc.spi.iam.IdentityService` (required)
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolTokenValidator` (optional)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolVersionRegistry` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowManager` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.TransferTypeParser` (required)

Module `control-plane-api`
--------------------------
**Artifact:** org.eclipse.edc:control-plane-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.ControlPlaneApiExtension`
**Name:** "Control Plane API"

**Overview:**  {@link ControlPlaneApiExtension } exposes HTTP endpoints for internal interaction with the Control Plane



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessService` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `control-plane-api-client`
---------------------------------
**Artifact:** org.eclipse.edc:control-plane-api-client:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.client.ControlPlaneApiClientExtension`
**Name:** "Control Plane HTTP API client"

**Overview:**  Extensions that contains clients for Control Plane HTTP APIs



### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.api.client.spi.transferprocess.TransferProcessApiClient`

#### Referenced (injected) services
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.http.spi.ControlApiHttpClient` (required)

Module `control-plane-api-client-spi`
-------------------------------------
**Name:** Control Plane API Services
**Artifact:** org.eclipse.edc:control-plane-api-client-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.api.client.spi.transferprocess.TransferProcessApiClient`

### Extensions
Module `control-plane-catalog`
------------------------------
**Artifact:** org.eclipse.edc:control-plane-catalog:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.catalog.CatalogDefaultServicesExtension`
**Name:** "Catalog Default Services"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.catalog.spi.DataServiceRegistry`
- `org.eclipse.edc.connector.controlplane.catalog.spi.DistributionResolver`

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowManager` (required)

#### Class: `org.eclipse.edc.connector.controlplane.catalog.CatalogCoreExtension`
**Name:** "Catalog Core"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.catalog.spi.DatasetResolver`

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.asset.spi.index.AssetIndex` (required)
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore` (required)
- `org.eclipse.edc.connector.controlplane.catalog.spi.DistributionResolver` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.store.ContractDefinitionStore` (required)
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)

Module `control-plane-contract`
-------------------------------
**Artifact:** org.eclipse.edc:control-plane-contract:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.contract.ContractNegotiationDefaultServicesExtension`
**Name:** "Contract Negotiation Default Services"

**Overview:**  Contract Negotiation Default Services Extension



### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.ConsumerOfferResolver`
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.observe.ContractNegotiationObservable`
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyArchive`
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ContractNegotiationPendingGuard`

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.store.ContractDefinitionStore` (required)
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore` (required)

#### Class: `org.eclipse.edc.connector.controlplane.contract.ContractCoreExtension`
**Name:** "Contract Core"

**Overview:**  Contract Negotiation Default Services Extension



### Configuration

| Key                                                   | Required | Type     | Default | Pattern | Min | Max | Description |
| ----------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.negotiation.state-machine.iteration-wait-millis` | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.negotiation.consumer.state-machine.batch-size`   | `*`      | `string` | `20`    |         |     |     |             |
| `edc.negotiation.provider.state-machine.batch-size`   | `*`      | `string` | `20`    |         |     |     |             |
| `edc.negotiation.consumer.send.retry.limit`           | `*`      | `string` | `7`     |         |     |     |             |
| `edc.negotiation.provider.send.retry.limit`           | `*`      | `string` | `7`     |         |     |     |             |
| `edc.negotiation.consumer.send.retry.base-delay.ms`   | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.negotiation.provider.send.retry.base-delay.ms`   | `*`      | `string` | `1000`  |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.contract.spi.validation.ContractValidationService`
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ConsumerContractNegotiationManager`
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ProviderContractNegotiationManager`

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.asset.spi.index.AssetIndex` (required)
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore` (required)
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.spi.telemetry.Telemetry` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.policy.engine.spi.RuleBindingRegistry` (required)
- `org.eclipse.edc.spi.protocol.ProtocolWebhook` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.observe.ContractNegotiationObservable` (required)
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.ContractNegotiationPendingGuard` (required)
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)

#### Class: `org.eclipse.edc.connector.controlplane.contract.ContractNegotiationCommandExtension`
**Name:** "Contract Negotiation command handlers"

**Overview:**  Contract Negotiation Default Services Extension



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore` (required)
- `org.eclipse.edc.spi.command.CommandHandlerRegistry` (required)

Module `control-plane-core`
---------------------------
**Artifact:** org.eclipse.edc:control-plane-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.ControlPlaneDefaultServicesExtension`
**Name:** "Control Plane Default Services"

**Overview:**  Provides default service implementations for fallback



### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.asset.spi.index.AssetIndex`
- `org.eclipse.edc.connector.controlplane.asset.spi.index.DataAddressResolver`
- `org.eclipse.edc.connector.controlplane.contract.spi.offer.store.ContractDefinitionStore`
- `org.eclipse.edc.connector.controlplane.contract.spi.negotiation.store.ContractNegotiationStore`
- `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore`
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore`
- `org.eclipse.edc.connector.controlplane.services.spi.callback.CallbackRegistry`
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolVersionRegistry`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

Module `control-plane-transfer`
-------------------------------
**Artifact:** org.eclipse.edc:control-plane-transfer:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.transfer.TransferProcessDefaultServicesExtension`
**Name:** "Transfer Process Default Services"

**Overview:**  Provides core data transfer services to the system.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowManager`
- `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ResourceManifestGenerator`
- `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ProvisionManager`
- `org.eclipse.edc.connector.controlplane.transfer.spi.observe.TransferProcessObservable`
- `org.eclipse.edc.connector.controlplane.transfer.spi.TransferProcessPendingGuard`
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.TransferTypeParser`

#### Referenced (injected) services
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)

#### Class: `org.eclipse.edc.connector.controlplane.transfer.TransferCoreExtension`
**Name:** "Transfer Core"

**Overview:**  Provides core data transfer services to the system.



### Configuration

| Key                                                | Required | Type     | Default | Pattern | Min | Max | Description |
| -------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.transfer.state-machine.iteration-wait-millis` | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.transfer.state-machine.batch-size`            | `*`      | `string` | `20`    |         |     |     |             |
| `edc.transfer.send.retry.limit`                    | `*`      | `string` | `7`     |         |     |     |             |
| `edc.transfer.send.retry.base-delay.ms`            | `*`      | `string` | `1000`  |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.transfer.spi.TransferProcessManager`
- `org.eclipse.edc.connector.controlplane.transfer.spi.edr.EndpointDataReferenceReceiverRegistry`

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowManager` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ResourceManifestGenerator` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ProvisionManager` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.observe.TransferProcessObservable` (required)
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyArchive` (required)
- `org.eclipse.edc.spi.command.CommandHandlerRegistry` (required)
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry` (required)
- `org.eclipse.edc.connector.controlplane.asset.spi.index.DataAddressResolver` (required)
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.telemetry.Telemetry` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.spi.protocol.ProtocolWebhook` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.TransferProcessPendingGuard` (required)
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)

#### Class: `org.eclipse.edc.connector.controlplane.transfer.TransferProcessCommandExtension`
**Name:** "TransferProcessCommandExtension"

**Overview:**  Provides core data transfer services to the system.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore` (required)

Module `core-spi`
-----------------
**Name:** Core services
**Artifact:** org.eclipse.edc:core-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry`
  - `org.eclipse.edc.spi.command.CommandHandlerRegistry`
  - `org.eclipse.edc.spi.iam.IdentityService`
  - `org.eclipse.edc.spi.iam.AudienceResolver`
  - `org.eclipse.edc.spi.event.EventRouter`

### Extensions
Module `data-plane`
-------------------
**Artifact:** org.eclipse.edc:data-plane:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.test.e2e.runtime.dataplane.PollingHttpExtension`
**Name:** "PollingHttpExtension"

### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)

Module `data-plane-core`
------------------------
**Artifact:** org.eclipse.edc:data-plane-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.framework.DataPlaneDefaultServicesExtension`
**Name:** "Data Plane Framework Default Services"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.dataplane.framework.registry.TransferServiceSelectionStrategy`
- `org.eclipse.edc.connector.dataplane.spi.store.DataPlaneStore`
- `org.eclipse.edc.connector.dataplane.spi.store.AccessTokenDataStore`
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService`
- `org.eclipse.edc.connector.dataplane.spi.iam.PublicEndpointGeneratorService`
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAuthorizationService`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

#### Class: `org.eclipse.edc.connector.dataplane.framework.DataPlaneFrameworkExtension`
**Name:** "Data Plane Framework"

**Overview:** No overview provided.


### Configuration

| Key                                                 | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.dataplane.state-machine.flow.lease.time`       | `*`      | `string` | `500`   |         |     |     |             |
| `edc.dataplane.state-machine.flow.lease.factor`     | `*`      | `string` | `5`     |         |     |     |             |
| `edc.dataplane.state-machine.iteration-wait-millis` | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.dataplane.state-machine.batch-size`            | `*`      | `string` | `20`    |         |     |     |             |
| `edc.dataplane.send.retry.limit`                    | `*`      | `string` | `7`     |         |     |     |             |
| `edc.dataplane.send.retry.base-delay.ms`            | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.dataplane.transfer.threads`                    | `*`      | `string` | `20`    |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.spi.manager.DataPlaneManager`
- `org.eclipse.edc.connector.dataplane.spi.registry.TransferServiceRegistry`
- `org.eclipse.edc.connector.dataplane.spi.pipeline.DataTransferExecutorServiceContainer`

#### Referenced (injected) services
- `org.eclipse.edc.connector.dataplane.framework.registry.TransferServiceSelectionStrategy` (required)
- `org.eclipse.edc.connector.dataplane.spi.store.DataPlaneStore` (required)
- `org.eclipse.edc.connector.controlplane.api.client.spi.transferprocess.TransferProcessApiClient` (required)
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)
- `org.eclipse.edc.spi.telemetry.Telemetry` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAuthorizationService` (required)

Module `data-plane-http`
------------------------
**Artifact:** org.eclipse.edc:data-plane-http:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.http.DataPlaneHttpExtension`
**Name:** "Data Plane HTTP"

**Overview:**  Provides support for reading data from an HTTP endpoint and sending data to an HTTP endpoint.



### Configuration

| Key                                      | Required | Type     | Default | Pattern | Min | Max | Description |
| ---------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.dataplane.http.sink.partition.size` | `*`      | `string` | `5`     |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.http.spi.HttpRequestParamsProvider`

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService` (required)
- `org.eclipse.edc.connector.dataplane.spi.pipeline.DataTransferExecutorServiceContainer` (required)
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `data-plane-http-oauth2-core`
------------------------------------
**Artifact:** org.eclipse.edc:data-plane-http-oauth2-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.http.oauth2.DataPlaneHttpOauth2Extension`
**Name:** "Data Plane HTTP OAuth2"

**Overview:**  Provides support for adding OAuth2 authentication to http data transfer



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.connector.dataplane.http.spi.HttpRequestParamsProvider` (required)
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider` (required)
- `org.eclipse.edc.iam.oauth2.spi.client.Oauth2Client` (required)

Module `data-plane-iam`
-----------------------
**Artifact:** org.eclipse.edc:data-plane-iam:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.iam.DataPlaneIamDefaultServicesExtension`
**Name:** "Data Plane Default IAM Services"

**Overview:** No overview provided.


### Configuration

| Key                                                 | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.transfer.proxy.token.signer.privatekey.alias`  | `*`      | `string` | ``      |         |     |     |             |
| `edc.transfer.proxy.token.verifier.publickey.alias` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAccessControlService`
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAccessTokenService`

#### Referenced (injected) services
- `org.eclipse.edc.connector.dataplane.spi.store.AccessTokenDataStore` (required)
- `org.eclipse.edc.token.spi.TokenValidationService` (required)
- `org.eclipse.edc.keys.spi.LocalPublicKeyService` (required)
- `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider` (required)

#### Class: `org.eclipse.edc.connector.dataplane.iam.DataPlaneIamExtension`
**Name:** "Data Plane IAM"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAuthorizationService`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAccessTokenService` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAccessControlService` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.PublicEndpointGeneratorService` (required)

Module `data-plane-instance-store-sql`
--------------------------------------
**Artifact:** org.eclipse.edc:data-plane-instance-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.selector.store.sql.SqlDataPlaneInstanceStoreExtension`
**Name:** "Sql Data Plane Instance Store"

**Overview:**  Extensions that expose an implementation of {@link DataPlaneInstanceStore} that uses SQL as backend storage



### Configuration

| Key                                          | Required | Type     | Default   | Pattern | Min | Max | Description |
| -------------------------------------------- | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.dataplaneinstance.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.selector.spi.store.DataPlaneInstanceStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.dataplane.selector.store.sql.schema.DataPlaneInstanceStatements` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `data-plane-kafka`
-------------------------
**Artifact:** org.eclipse.edc:data-plane-kafka:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.kafka.DataPlaneKafkaExtension`
**Name:** "Data Plane Kafka"

**Overview:** No overview provided.


### Configuration

| Key                                       | Required | Type     | Default | Pattern | Min | Max | Description |
| ----------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.dataplane.kafka.sink.partition.size` | `*`      | `string` | `5`     |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.dataplane.spi.pipeline.DataTransferExecutorServiceContainer` (required)
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService` (required)
- `java.time.Clock` (required)

Module `data-plane-public-api-v2`
---------------------------------
**Artifact:** org.eclipse.edc:data-plane-public-api-v2:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.api.DataPlanePublicApiV2Extension`
**Name:** "Data Plane Public API"

**Overview:**  This extension provides generic endpoints which are open to public participants of the Dataspace to execute
 requests on the actual data source.



### Configuration

| Key                                         | Required | Type     | Default       | Pattern | Min | Max | Description |
| ------------------------------------------- | -------- | -------- | ------------- | ------- | --- | --- | ----------- |
| `web.http.public.port`                      | `*`      | `string` | `8185`        |         |     |     |             |
| `web.http.public.path`                      | `*`      | `string` | `/api/public` |         |     |     |             |
| `edc.dataplane.api.public.baseurl`          |          | `string` | ``            |         |     |     |             |
| `edc.dataplane.api.public.response.baseurl` |          | `string` | ``            |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService` (required)
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAuthorizationService` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.PublicEndpointGeneratorService` (required)
- `org.eclipse.edc.spi.system.Hostname` (required)

Module `data-plane-selector-api`
--------------------------------
**Artifact:** org.eclipse.edc:data-plane-selector-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.selector.DataPlaneSelectorApiExtension`
**Name:** "DataPlane selector API"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)

Module `data-plane-selector-client`
-----------------------------------
**Artifact:** org.eclipse.edc:data-plane-selector-client:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.selector.DataPlaneSelectorClientExtension`
**Name:** "DataPlane Selector client"

**Overview:** No overview provided.


### Configuration

| Key                                      | Required | Type     | Default  | Pattern | Min | Max | Description |
| ---------------------------------------- | -------- | -------- | -------- | ------- | --- | --- | ----------- |
| `edc.dpf.selector.url`                   | `*`      | `string` | ``       |         |     |     |             |
| `edc.dataplane.client.selector.strategy` | `*`      | `string` | `random` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService`

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.ControlApiHttpClient` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)

Module `data-plane-selector-control-api`
----------------------------------------
**Artifact:** org.eclipse.edc:data-plane-selector-control-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.selector.control.api.DataplaneSelectorControlApiExtension`
**Name:** "Dataplane Selector Control API"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService` (required)
- `java.time.Clock` (required)

Module `data-plane-selector-core`
---------------------------------
**Artifact:** org.eclipse.edc:data-plane-selector-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.selector.DataPlaneSelectorDefaultServicesExtension`
**Name:** "DataPlaneSelectorDefaultServicesExtension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.dataplane.selector.spi.store.DataPlaneInstanceStore`
- `org.eclipse.edc.connector.dataplane.selector.spi.strategy.SelectionStrategyRegistry`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

#### Class: `org.eclipse.edc.connector.dataplane.selector.DataPlaneSelectorExtension`
**Name:** "Data Plane Selector core"

**Overview:** No overview provided.


### Configuration

| Key                                                           | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.data.plane.selector.state-machine.iteration-wait-millis` | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.data.plane.selector.state-machine.batch-size`            | `*`      | `string` | `20`    |         |     |     |             |
| `edc.data.plane.selector.state-machine.check.period`          | `*`      | `string` | `60`    |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService`

#### Referenced (injected) services
- `org.eclipse.edc.connector.dataplane.selector.spi.store.DataPlaneInstanceStore` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.dataplane.selector.spi.strategy.SelectionStrategyRegistry` (required)
- `org.eclipse.edc.connector.dataplane.selector.spi.client.DataPlaneClientFactory` (required)

Module `data-plane-selector-spi`
--------------------------------
**Name:** DataPlane selector services
**Artifact:** org.eclipse.edc:data-plane-selector-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService`
  - `org.eclipse.edc.connector.dataplane.selector.spi.client.DataPlaneClient`

### Extensions
Module `data-plane-self-registration`
-------------------------------------
**Artifact:** org.eclipse.edc:data-plane-self-registration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.registration.DataplaneSelfRegistrationExtension`
**Name:** "Dataplane Self Registration"

**Overview:** No overview provided.


### Configuration

| Key                                  | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------------ | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.data.plane.self.unregistration` | `*`      | `string` | `false` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService` (required)
- `org.eclipse.edc.web.spi.configuration.context.ControlApiUrl` (required)
- `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService` (required)
- `org.eclipse.edc.connector.dataplane.spi.iam.PublicEndpointGeneratorService` (required)
- `org.eclipse.edc.spi.system.health.HealthCheckService` (required)

Module `data-plane-signaling-api`
---------------------------------
**Artifact:** org.eclipse.edc:data-plane-signaling-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.api.DataPlaneSignalingApiExtension`
**Name:** "DataPlane Signaling API extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.dataplane.spi.manager.DataPlaneManager` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `data-plane-signaling-client`
------------------------------------
**Artifact:** org.eclipse.edc:data-plane-signaling-client:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.client.DataPlaneSignalingClientTransformExtension`
**Name:** "Data Plane Signaling transform Client"

**Overview:**  This extension registers all the transformers relevant for the data plane signaling protocol



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

#### Class: `org.eclipse.edc.connector.dataplane.client.DataPlaneSignalingClientExtension`
**Name:** "Data Plane Signaling Client"

**Overview:**  This extension registers all the transformers relevant for the data plane signaling protocol



### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.dataplane.selector.spi.client.DataPlaneClientFactory`

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.ControlApiHttpClient` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.connector.dataplane.spi.manager.DataPlaneManager` (optional)

Module `data-plane-spi`
-----------------------
**Name:** DataPlane services
**Artifact:** org.eclipse.edc:data-plane-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.dataplane.spi.pipeline.PipelineService`
  - `org.eclipse.edc.connector.dataplane.spi.manager.DataPlaneManager`
  - `org.eclipse.edc.connector.dataplane.spi.registry.TransferServiceRegistry`
  - `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAccessTokenService`
  - `org.eclipse.edc.connector.dataplane.spi.iam.DataPlaneAccessControlService`

### Extensions
Module `data-plane-store-sql`
-----------------------------
**Artifact:** org.eclipse.edc:data-plane-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.dataplane.store.sql.SqlDataPlaneStoreExtension`
**Name:** "Sql Data Plane Store"

**Overview:**  Provides Sql Store for Data Plane Flow Requests states



### Configuration

| Key                                  | Required | Type     | Default   | Pattern | Min | Max | Description |
| ------------------------------------ | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.dataplane.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.dataplane.spi.store.DataPlaneStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.dataplane.store.sql.schema.DataFlowStatements` (optional)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `dsp-catalog-http-api`
-----------------------------
**Artifact:** org.eclipse.edc:dsp-catalog-http-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.catalog.http.api.DspCatalogApiExtension`
**Name:** "Dataspace Protocol Catalog Extension"

**Overview:**  Creates and registers the controller for dataspace protocol catalog requests.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.spi.protocol.ProtocolWebhook` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.catalog.CatalogProtocolService` (required)
- `org.eclipse.edc.connector.controlplane.catalog.spi.DataServiceRegistry` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.message.DspRequestHandler` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolVersionRegistry` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)

Module `dsp-catalog-http-dispatcher`
------------------------------------
**Artifact:** org.eclipse.edc:dsp-catalog-http-dispatcher:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.catalog.http.dispatcher.DspCatalogHttpDispatcherExtension`
**Name:** "Dataspace Protocol Catalog HTTP Dispatcher Extension"

**Overview:**  Creates and registers the HTTP dispatcher delegate for sending a catalog request as defined in
 the dataspace protocol specification.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.protocol.dsp.http.spi.dispatcher.DspHttpRemoteMessageDispatcher` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.serialization.JsonLdRemoteMessageSerializer` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.DspProtocolParser` (required)

Module `dsp-catalog-transform`
------------------------------
**Artifact:** org.eclipse.edc:dsp-catalog-transform:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.catalog.transform.DspCatalogTransformExtension`
**Name:** "Dataspace Protocol Catalog Transform Extension"

**Overview:**  Provides the transformers for catalog message types via the {@link TypeTransformerRegistry}.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.participant.spi.ParticipantIdMapper` (required)

Module `dsp-http-api-configuration`
-----------------------------------
**Artifact:** org.eclipse.edc:dsp-http-api-configuration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.http.api.configuration.DspApiConfigurationExtension`
**Name:** "Dataspace Protocol API Configuration Extension"

**Overview:**  Configure 'protocol' api context.



### Configuration

| Key                        | Required | Type     | Default         | Pattern | Min | Max | Description |
| -------------------------- | -------- | -------- | --------------- | ------- | --- | --- | ----------- |
| `web.http.protocol.port`   | `*`      | `string` | `8282`          |         |     |     |             |
| `web.http.protocol.path`   | `*`      | `string` | `/api/protocol` |         |     |     |             |
| `edc.dsp.callback.address` |          | `string` | ``              |         |     |     |             |

#### Provided services
- `org.eclipse.edc.spi.protocol.ProtocolWebhook`

#### Referenced (injected) services
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.participant.spi.ParticipantIdMapper` (required)
- `org.eclipse.edc.spi.system.Hostname` (required)
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)

Module `dsp-http-core`
----------------------
**Artifact:** org.eclipse.edc:dsp-http-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.http.DspHttpCoreExtension`
**Name:** "Dataspace Protocol Core Extension"

**Overview:**  Provides an implementation of {@link DspHttpRemoteMessageDispatcher} to support sending dataspace
 protocol messages. The dispatcher can then be used by other extensions to add support for
 specific message types.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.protocol.dsp.http.spi.dispatcher.DspHttpRemoteMessageDispatcher`
- `org.eclipse.edc.protocol.dsp.http.spi.message.DspRequestHandler`
- `org.eclipse.edc.protocol.dsp.http.spi.serialization.JsonLdRemoteMessageSerializer`
- `org.eclipse.edc.protocol.dsp.spi.transform.DspProtocolTypeTransformerRegistry`
- `org.eclipse.edc.protocol.dsp.http.spi.DspProtocolParser`

#### Referenced (injected) services
- `org.eclipse.edc.spi.message.RemoteMessageDispatcherRegistry` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.iam.IdentityService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.token.spi.TokenDecorator` (optional)
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)
- `org.eclipse.edc.spi.iam.AudienceResolver` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolVersionRegistry` (required)

Module `dsp-negotiation-http-api`
---------------------------------
**Artifact:** org.eclipse.edc:dsp-negotiation-http-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.negotiation.http.api.DspNegotiationApiExtension`
**Name:** "Dataspace Protocol Negotiation Api"

**Overview:**  Creates and registers the controller for dataspace protocol negotiation requests.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.contractnegotiation.ContractNegotiationProtocolService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.message.DspRequestHandler` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolVersionRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `dsp-negotiation-http-dispatcher`
----------------------------------------
**Artifact:** org.eclipse.edc:dsp-negotiation-http-dispatcher:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.negotiation.http.dispatcher.DspNegotiationHttpDispatcherExtension`
**Name:** "Dataspace Protocol Negotiation HTTP Dispatcher Extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.protocol.dsp.http.spi.dispatcher.DspHttpRemoteMessageDispatcher` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.serialization.JsonLdRemoteMessageSerializer` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.protocol.dsp.spi.transform.DspProtocolTypeTransformerRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.DspProtocolParser` (required)

Module `dsp-negotiation-transform`
----------------------------------
**Artifact:** org.eclipse.edc:dsp-negotiation-transform:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.negotiation.transform.DspNegotiationTransformExtension`
**Name:** "Dataspace Protocol Negotiation Transform Extension"

**Overview:**  Provides the transformers for negotiation message types via the {@link TypeTransformerRegistry}.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)

Module `dsp-transfer-process-http-api`
--------------------------------------
**Artifact:** org.eclipse.edc:dsp-transfer-process-http-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.transferprocess.http.api.DspTransferProcessApiExtension`
**Name:** "Dataspace Protocol: TransferProcess API Extension"

**Overview:**  Creates and registers the controller for dataspace protocol transfer process requests.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessProtocolService` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.message.DspRequestHandler` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.ProtocolVersionRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `dsp-transfer-process-http-dispatcher`
---------------------------------------------
**Artifact:** org.eclipse.edc:dsp-transfer-process-http-dispatcher:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.transferprocess.http.dispatcher.DspTransferProcessDispatcherExtension`
**Name:** "Dataspace Protocol Transfer HTTP Dispatcher Extension"

**Overview:**  Provides HTTP dispatching for Dataspace Protocol transfer process messages via the {@link DspHttpRemoteMessageDispatcher}.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.protocol.dsp.http.spi.dispatcher.DspHttpRemoteMessageDispatcher` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.serialization.JsonLdRemoteMessageSerializer` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.protocol.dsp.spi.transform.DspProtocolTypeTransformerRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.DspProtocolParser` (required)

Module `dsp-transfer-process-transform`
---------------------------------------
**Artifact:** org.eclipse.edc:dsp-transfer-process-transform:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.transferprocess.transform.DspTransferProcessTransformExtension`
**Name:** "Dataspace Protocol Transfer Process Transform Extension"

**Overview:**  Provides the transformers for transferprocess message types via the {@link TypeTransformerRegistry}.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `dsp-version-http-api`
-----------------------------
**Artifact:** org.eclipse.edc:dsp-version-http-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.version.http.api.DspVersionApiExtension`
**Name:** "Dataspace Protocol Version Api"

**Overview:**  Provide API for the protocol versions.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.message.DspRequestHandler` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.VersionProtocolService` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `dsp-version-http-dispatcher`
------------------------------------
**Artifact:** org.eclipse.edc:dsp-version-http-dispatcher:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.protocol.dsp.version.http.dispatcher.DspVersionHttpDispatcherExtension`
**Name:** "Dataspace Protocol Version HTTP Dispatcher Extension"

**Overview:**  Creates and registers the HTTP dispatcher delegate for sending a version request as defined in
 the dataspace protocol specification.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.protocol.dsp.http.spi.dispatcher.DspHttpRemoteMessageDispatcher` (required)
- `org.eclipse.edc.protocol.dsp.http.spi.DspProtocolParser` (required)

Module `edr-cache-api`
----------------------
**Artifact:** org.eclipse.edc:edr-cache-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.edr.EdrCacheApiExtension`
**Name:** "Management API: EDR cache"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceStore` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)

Module `edr-index-sql`
----------------------
**Artifact:** org.eclipse.edc:edr-index-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.edr.store.index.SqlEndpointDataReferenceEntryIndexExtension`
**Name:** "SQL edr entry store"

**Overview:** No overview provided.


### Configuration

| Key                            | Required | Type     | Default   | Pattern | Min | Max | Description |
| ------------------------------ | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.edr.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceEntryIndex`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.edr.store.index.sql.schema.EndpointDataReferenceEntryStatements` (optional)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `edr-store-core`
-----------------------
**Artifact:** org.eclipse.edc:edr-store-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.edr.store.EndpointDataReferenceStoreExtension`
**Name:** "Endpoint Data Reference Core Extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceStore`

#### Referenced (injected) services
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceEntryIndex` (required)
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceCache` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)

#### Class: `org.eclipse.edc.edr.store.EndpointDataReferenceStoreDefaultServicesExtension`
**Name:** "Endpoint Data Reference Core Default Services Extension"

**Overview:** No overview provided.


### Configuration

| Key                  | Required | Type     | Default | Pattern | Min | Max | Description |
| -------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.edr.vault.path` |          | `string` | ``      |         |     |     |             |

#### Provided services
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceCache`
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceEntryIndex`

#### Referenced (injected) services
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `edr-store-receiver`
---------------------------
**Artifact:** org.eclipse.edc:edr-store-receiver:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.edr.store.receiver.EndpointDataReferenceStoreReceiverExtension`
**Name:** "Endpoint Data Reference Store Receiver Extension"

**Overview:** No overview provided.


### Configuration

| Key                     | Required | Type     | Default | Pattern | Min | Max | Description |
| ----------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.edr.receiver.sync` | `*`      | `string` | `false` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `org.eclipse.edc.edr.spi.store.EndpointDataReferenceStore` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.contractagreement.ContractAgreementService` (required)
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyArchive` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)

Module `events-cloud-http`
--------------------------
**Artifact:** org.eclipse.edc:events-cloud-http:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.event.cloud.http.CloudEventsHttpExtension`
**Name:** "Cloud events HTTP"

**Overview:** No overview provided.


### Configuration

| Key                               | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.events.cloudevents.endpoint` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.system.Hostname` (required)

Module `iam-mock`
-----------------
**Artifact:** org.eclipse.edc:iam-mock:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.mock.IamMockExtension`
**Name:** "Mock IAM"

**Overview:**  An IAM provider mock used for testing.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.spi.iam.IdentityService`
- `org.eclipse.edc.spi.iam.AudienceResolver`

#### Referenced (injected) services
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `identity-did-core`
--------------------------
**Artifact:** org.eclipse.edc:identity-did-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.did.IdentityDidCoreExtension`
**Name:** "Identity Did Core"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.iam.did.spi.resolution.DidResolverRegistry`
- `org.eclipse.edc.iam.did.spi.resolution.DidPublicKeyResolver`

#### Referenced (injected) services
- `org.eclipse.edc.keys.spi.KeyParserRegistry` (required)

Module `identity-did-spi`
-------------------------
**Name:** IAM DID services
**Artifact:** org.eclipse.edc:identity-did-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.iam.did.spi.resolution.DidPublicKeyResolver`
  - `org.eclipse.edc.iam.did.spi.resolution.DidResolverRegistry`
  - `org.eclipse.edc.iam.did.spi.store.DidStore`
  - `org.eclipse.edc.iam.did.spi.credentials.CredentialsVerifier`

### Extensions
Module `identity-did-web`
-------------------------
**Artifact:** org.eclipse.edc:identity-did-web:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.did.web.WebDidExtension`
**Name:** "Web DID"

**Overview:**  Initializes support for resolving Web DIDs.



### Configuration

| Key                         | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.webdid.doh.url`        | `*`      | `string` | ``      |         |     |     |             |
| `edc.iam.did.web.use.https` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.iam.did.spi.resolution.DidResolverRegistry` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `identity-trust-core`
----------------------------
**Artifact:** org.eclipse.edc:identity-trust-core:0.11.1

**Categories:** _iam, transform, jsonld, iam, transform, jsonld_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.core.DcpScopeExtractorExtension`
**Name:** "DCP scope extractor extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)
- `org.eclipse.edc.iam.identitytrust.spi.scope.ScopeExtractorRegistry` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)

#### Class: `org.eclipse.edc.iam.identitytrust.core.IdentityTrustTransformExtension`
**Name:** "Identity And Trust Transform Extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

#### Class: `org.eclipse.edc.iam.identitytrust.core.IdentityAndTrustExtension`
**Name:** "Identity And Trust Extension"

**Overview:** No overview provided.


### Configuration

| Key                                            | Required | Type     | Default  | Pattern | Min | Max | Description |
| ---------------------------------------------- | -------- | -------- | -------- | ------- | --- | --- | ----------- |
| `edc.iam.credential.revocation.cache.validity` | `*`      | `string` | `900000` |         |     |     |             |
| `edc.iam.issuer.id`                            | `*`      | `string` | ``       |         |     |     |             |
| `edc.sql.store.jti.cleanup.period`             | `*`      | `string` | `60`     |         |     |     |             |

#### Provided services
- `org.eclipse.edc.spi.iam.IdentityService`
- `org.eclipse.edc.iam.identitytrust.spi.CredentialServiceClient`
- `org.eclipse.edc.iam.verifiablecredentials.spi.validation.PresentationVerifier`

#### Referenced (injected) services
- `org.eclipse.edc.iam.identitytrust.spi.SecureTokenService` (required)
- `org.eclipse.edc.iam.verifiablecredentials.spi.validation.TrustedIssuerRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.iam.identitytrust.spi.verification.SignatureSuiteRegistry` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.iam.did.spi.resolution.DidResolverRegistry` (required)
- `org.eclipse.edc.token.spi.TokenValidationService` (required)
- `org.eclipse.edc.token.spi.TokenValidationRulesRegistry` (required)
- `org.eclipse.edc.iam.did.spi.resolution.DidPublicKeyResolver` (required)
- `org.eclipse.edc.iam.identitytrust.spi.ClaimTokenCreatorFunction` (required)
- `org.eclipse.edc.participant.spi.ParticipantAgentService` (required)
- `org.eclipse.edc.iam.identitytrust.spi.DcpParticipantAgentServiceExtension` (required)
- `org.eclipse.edc.iam.verifiablecredentials.spi.model.RevocationServiceRegistry` (required)
- `org.eclipse.edc.jwt.validation.jti.JtiValidationStore` (required)
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)

#### Class: `org.eclipse.edc.iam.identitytrust.core.DcpDefaultServicesExtension`
**Name:** "Identity And Trust Extension to register default services"

**Overview:** No overview provided.


### Configuration

| Key                            | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------ | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.iam.sts.privatekey.alias` |          | `string` | ``      |         |     |     |             |
| `edc.iam.sts.publickey.id`     |          | `string` | ``      |         |     |     |             |
| `edc.iam.sts.token.expiration` | `*`      | `string` | `5`     |         |     |     |             |

#### Provided services
- `org.eclipse.edc.iam.identitytrust.spi.SecureTokenService`
- `org.eclipse.edc.iam.verifiablecredentials.spi.validation.TrustedIssuerRegistry`
- `org.eclipse.edc.iam.identitytrust.spi.verification.SignatureSuiteRegistry`
- `org.eclipse.edc.iam.identitytrust.spi.DcpParticipantAgentServiceExtension`
- `org.eclipse.edc.iam.identitytrust.spi.scope.ScopeExtractorRegistry`
- `org.eclipse.edc.spi.iam.AudienceResolver`
- `org.eclipse.edc.iam.identitytrust.spi.ClaimTokenCreatorFunction`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider` (required)
- `org.eclipse.edc.jwt.validation.jti.JtiValidationStore` (required)

Module `identity-trust-issuers-configuration`
---------------------------------------------
**Artifact:** org.eclipse.edc:identity-trust-issuers-configuration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.issuer.configuration.TrustedIssuerConfigurationExtension`
**Name:** "Trusted Issuers Configuration Extensions"

**Overview:**  This DCP extension makes it possible to configure a list of trusted issuers, that will be matched against the Verifiable Credential issuers.



### Configuration

| Key                                                   | Required | Type     | Default | Pattern | Min | Max | Description                                         |
| ----------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | --------------------------------------------------- |
| `edc.iam.trusted-issuer.<issuerAlias>.id`             | `*`      | `string` | ``      |         |     |     | ID of the issuer.                                   |
| `edc.iam.trusted-issuer.<issuerAlias>.properties`     | `*`      | `string` | ``      |         |     |     | Additional properties of the issuer.                |
| `edc.iam.trusted-issuer.<issuerAlias>.supportedtypes` | `*`      | `string` | ``      |         |     |     | List of supported credential types for this issuer. |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.iam.verifiablecredentials.spi.validation.TrustedIssuerRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)

Module `identity-trust-sts-accounts-api`
----------------------------------------
**Artifact:** org.eclipse.edc:identity-trust-sts-accounts-api:0.11.1

**Categories:** _sts, dcp, api, sts, dcp, api_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.iam.identitytrust.sts.accounts.StsAccountsApiConfigurationExtension`
**Name:** "Secure Token Service Accounts API configuration"

**Overview:** No overview provided.


### Configuration

| Key                      | Required | Type     | Default         | Pattern | Min | Max | Description |
| ------------------------ | -------- | -------- | --------------- | ------- | --- | --- | ----------- |
| `web.http.accounts.port` | `*`      | `string` | `9393`          |         |     |     |             |
| `web.http.accounts.path` | `*`      | `string` | `/api/accounts` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService` (required)
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)

#### Class: `org.eclipse.edc.api.iam.identitytrust.sts.accounts.StsAccountsApiExtension`
**Name:** "Secure Token Service Accounts API Extension"

**Overview:** No overview provided.


### Configuration

| Key                    | Required | Type     | Default | Pattern | Min | Max | Description |
| ---------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.api.accounts.key` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.iam.identitytrust.sts.spi.service.StsAccountService` (required)
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry` (required)
- `org.eclipse.edc.spi.security.Vault` (required)

Module `identity-trust-sts-api`
-------------------------------
**Artifact:** org.eclipse.edc:identity-trust-sts-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.api.iam.identitytrust.sts.StsApiConfigurationExtension`
**Name:** "Secure Token Service API configuration"

**Overview:** No overview provided.


### Configuration

| Key                 | Required | Type     | Default    | Pattern | Min | Max | Description |
| ------------------- | -------- | -------- | ---------- | ------- | --- | --- | ----------- |
| `web.http.sts.port` | `*`      | `string` | `9292`     |         |     |     |             |
| `web.http.sts.path` | `*`      | `string` | `/api/sts` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService` (required)

#### Class: `org.eclipse.edc.api.iam.identitytrust.sts.SecureTokenServiceApiExtension`
**Name:** "Secure Token Service API"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.iam.identitytrust.sts.spi.service.StsAccountService` (required)
- `org.eclipse.edc.iam.identitytrust.sts.spi.service.StsClientTokenGeneratorService` (required)
- `org.eclipse.edc.web.spi.WebService` (required)

Module `identity-trust-sts-client-configuration`
------------------------------------------------
**Artifact:** org.eclipse.edc:identity-trust-sts-client-configuration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.sts.client.configuration.StsClientConfigurationExtension`
**Name:** "STS Client Configuration extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.iam.identitytrust.sts.spi.store.StsAccountStore` (required)

Module `identity-trust-sts-core`
--------------------------------
**Artifact:** org.eclipse.edc:identity-trust-sts-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.sts.defaults.StsDefaultStoresExtension`
**Name:** "Secure Token Service Default Stores"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.iam.identitytrust.sts.spi.store.StsAccountStore`

#### Referenced (injected) services
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

#### Class: `org.eclipse.edc.iam.identitytrust.sts.defaults.StsDefaultServicesExtension`
**Name:** "Secure Token Service Default Services"

**Overview:** No overview provided.


### Configuration

| Key                            | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------ | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.iam.sts.token.expiration` | `*`      | `string` | `5`     |         |     |     |             |

#### Provided services
- `org.eclipse.edc.iam.identitytrust.sts.spi.service.StsClientTokenGeneratorService`
- `org.eclipse.edc.iam.identitytrust.sts.spi.service.StsAccountService`

#### Referenced (injected) services
- `org.eclipse.edc.iam.identitytrust.sts.spi.store.StsAccountStore` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.spi.security.Vault` (required)
- `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.iam.identitytrust.sts.spi.service.StsClientSecretGenerator` (optional)
- `org.eclipse.edc.jwt.validation.jti.JtiValidationStore` (required)

Module `identity-trust-sts-remote-client`
-----------------------------------------
**Artifact:** org.eclipse.edc:identity-trust-sts-remote-client:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.sts.remote.client.StsRemoteClientConfigurationExtension`
**Name:** "Sts remote client configuration extension"

**Overview:**  Configuration Extension for the STS OAuth2 client



### Configuration

| Key                                     | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.iam.sts.oauth.token.url`           | `*`      | `string` | ``      |         |     |     |             |
| `edc.iam.sts.oauth.client.id`           | `*`      | `string` | ``      |         |     |     |             |
| `edc.iam.sts.oauth.client.secret.alias` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
- `org.eclipse.edc.iam.identitytrust.sts.remote.StsRemoteClientConfiguration`

#### Referenced (injected) services
- `org.eclipse.edc.spi.security.Vault` (required)

#### Class: `org.eclipse.edc.iam.identitytrust.sts.remote.client.StsRemoteClientExtension`
**Name:** "Sts remote client configuration extension"

**Overview:**  Configuration Extension for the STS OAuth2 client



### Configuration_None_

#### Provided services
- `org.eclipse.edc.iam.identitytrust.spi.SecureTokenService`

#### Referenced (injected) services
- `org.eclipse.edc.iam.identitytrust.sts.remote.StsRemoteClientConfiguration` (required)
- `org.eclipse.edc.iam.oauth2.spi.client.Oauth2Client` (required)
- `org.eclipse.edc.spi.security.Vault` (required)

Module `jersey-core`
--------------------
**Artifact:** org.eclipse.edc:jersey-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.web.jersey.JerseyExtension`
**Name:** "JerseyExtension"

### Configuration

| Key                         | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.web.rest.cors.origins` | `*`      | `string` | ``      |         |     |     |             |
| `edc.web.rest.cors.enabled` | `*`      | `string` | ``      |         |     |     |             |
| `edc.web.rest.cors.headers` | `*`      | `string` | ``      |         |     |     |             |
| `edc.web.rest.cors.methods` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
- `org.eclipse.edc.web.spi.WebService`
- `org.eclipse.edc.web.spi.validation.InterceptorFunctionRegistry`

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebServer` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `jersey-micrometer`
--------------------------
**Artifact:** org.eclipse.edc:jersey-micrometer:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.web.jersey.micrometer.JerseyMicrometerExtension`
**Name:** "JerseyMicrometerExtension"

### Configuration

| Key                          | Required | Type     | Default | Pattern | Min | Max | Description |
| ---------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.metrics.enabled`        | `*`      | `string` | ``      |         |     |     |             |
| `edc.metrics.jersey.enabled` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `io.micrometer.core.instrument.MeterRegistry` (required)

Module `jetty-core`
-------------------
**Artifact:** org.eclipse.edc:jetty-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.web.jetty.JettyExtension`
**Name:** "JettyExtension"

### Configuration

| Key                                 | Required | Type     | Default    | Pattern | Min | Max | Description |
| ----------------------------------- | -------- | -------- | ---------- | ------- | --- | --- | ----------- |
| `edc.web.https.keystore.password`   | `*`      | `string` | `password` |         |     |     |             |
| `edc.web.https.keymanager.password` | `*`      | `string` | `password` |         |     |     |             |
| `web.http.port`                     | `*`      | `string` | `8181`     |         |     |     |             |
| `web.http.path`                     | `*`      | `string` | `/api`     |         |     |     |             |
| ~~web.http.default.port~~           | `*`      | `string` | `8181`     |         |     |     |             |
| ~~web.http.default.path~~           | `*`      | `string` | `/api`     |         |     |     |             |
| `edc.web.https.keystore.path`       |          | `string` | ``         |         |     |     |             |
| `edc.web.https.keystore.type`       | `*`      | `string` | `PKCS12`   |         |     |     |             |

#### Provided services
- `org.eclipse.edc.web.spi.WebServer`
- `org.eclipse.edc.web.jetty.JettyService`
- `org.eclipse.edc.web.spi.configuration.WebServiceConfigurer`
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry`

#### Referenced (injected) services
_None_

Module `jetty-micrometer`
-------------------------
**Artifact:** org.eclipse.edc:jetty-micrometer:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.web.jetty.micrometer.JettyMicrometerExtension`
**Name:** "Jetty Micrometer Metrics"

**Overview:**  An extension that registers Micrometer {@link JettyConnectionMetrics} into Jetty to
 provide server metrics.



### Configuration

| Key                         | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.metrics.enabled`       | `*`      | `string` | ``      |         |     |     |             |
| `edc.metrics.jetty.enabled` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.jetty.JettyService` (required)
- `io.micrometer.core.instrument.MeterRegistry` (required)

Module `json-ld`
----------------
**Artifact:** org.eclipse.edc:json-ld:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.jsonld.JsonLdExtension`
**Name:** "JSON-LD Extension"

**Overview:**  Adds support for working with JSON-LD. Provides an ObjectMapper that works with Jakarta JSON-P
 types through the TypeManager context {@link CoreConstants#JSON_LD} and a registry
 for {@link JsonLdTransformer}s. The module also offers
 functions for working with JSON-LD structures.



### Configuration

| Key                                        | Required | Type      | Default | Pattern | Min | Max | Description                           |
| ------------------------------------------ | -------- | --------- | ------- | ------- | --- | --- | ------------------------------------- |
| `edc.jsonld.document.<documentAlias>.path` | `*`      | `string`  | ``      |         |     |     | Path of the JSON-LD document to cache |
| `edc.jsonld.document.<documentAlias>.url`  | `*`      | `string`  | ``      |         |     |     | URL of the JSON-LD document to cache  |
| `edc.jsonld.http.enabled`                  | `*`      | `string`  | `false` |         |     |     |                                       |
| `edc.jsonld.https.enabled`                 | `*`      | `boolean` | `false` |         |     |     |                                       |
| `edc.jsonld.vocab.disable`                 | `*`      | `string`  | `false` |         |     |     |                                       |
| `edc.jsonld.prefixes.check`                | `*`      | `boolean` | `true`  |         |     |     |                                       |

#### Provided services
- `org.eclipse.edc.jsonld.spi.JsonLd`

#### Referenced (injected) services
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `jti-validation-store-sql`
---------------------------------
**Artifact:** org.eclipse.edc:jti-validation-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.jtivalidation.store.sql.SqlJtiValidationStoreExtension`
**Name:** "SQL JTI Validation store"

**Overview:** No overview provided.


### Configuration

| Key                            | Required | Type     | Default   | Pattern | Min | Max | Description |
| ------------------------------ | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.jti.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.jwt.validation.jti.JtiValidationStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.jtivalidation.store.sql.schema.JtiValidationStoreStatements` (optional)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `jwt-signer-spi`
-----------------------
**Name:** Implementation SPI that is used to contribute custom JWSSigners to the JwtGenerationService
**Artifact:** org.eclipse.edc:jwt-signer-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider`

### Extensions
Module `jwt-spi`
----------------
**Name:** JTW services
**Artifact:** org.eclipse.edc:jwt-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.jwt.validation.jti.JtiValidationStore`

### Extensions
Module `management-api-configuration`
-------------------------------------
**Artifact:** org.eclipse.edc:management-api-configuration:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.api.management.configuration.ManagementApiConfigurationExtension`
**Name:** "Management API configuration"

**Overview:**  Configure 'management' api context.



### Configuration

| Key                              | Required | Type     | Default           | Pattern | Min | Max | Description |
| -------------------------------- | -------- | -------- | ----------------- | ------- | --- | --- | ----------- |
| `web.http.management.port`       | `*`      | `string` | `8181`            |         |     |     |             |
| `web.http.management.path`       | `*`      | `string` | `/api/management` |         |     |     |             |
| `edc.management.endpoint`        |          | `string` | ``                |         |     |     |             |
| `edc.management.context.enabled` | `*`      | `string` | `false`           |         |     |     |             |

#### Provided services
- `org.eclipse.edc.web.spi.configuration.context.ManagementApiUrl`

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry` (required)
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.jsonld.spi.JsonLd` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.participant.spi.ParticipantIdMapper` (required)
- `org.eclipse.edc.spi.system.Hostname` (required)
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService` (required)

Module `micrometer-core`
------------------------
**Artifact:** org.eclipse.edc:micrometer-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.metrics.micrometer.MicrometerExtension`
**Name:** "Micrometer Metrics"

**Overview:** No overview provided.


### Configuration

| Key                            | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------ | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.metrics.enabled`          | `*`      | `string` | ``      |         |     |     |             |
| `edc.metrics.system.enabled`   | `*`      | `string` | ``      |         |     |     |             |
| `edc.metrics.okhttp.enabled`   | `*`      | `string` | ``      |         |     |     |             |
| `edc.metrics.executor.enabled` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
- `okhttp3.EventListener`
- `org.eclipse.edc.spi.system.ExecutorInstrumentation`
- `io.micrometer.core.instrument.MeterRegistry`

#### Referenced (injected) services
_None_

Module `monitor-jdk-logger`
---------------------------
**Artifact:** org.eclipse.edc:monitor-jdk-logger:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.monitor.logger.LoggerMonitorExtension`
**Name:** "Logger monitor"

**Overview:**  Extension adding logging monitor.



### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
_None_

Module `oauth2-client`
----------------------
**Artifact:** org.eclipse.edc:oauth2-client:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.oauth2.client.Oauth2ClientExtension`
**Name:** "OAuth2 Client"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.iam.oauth2.spi.client.Oauth2Client`

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `oauth2-core`
--------------------
**Artifact:** org.eclipse.edc:oauth2-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.oauth2.Oauth2ServiceExtension`
**Name:** "OAuth2 Identity Service"

**Overview:**  Provides OAuth2 client credentials flow support.

 @deprecated please switch to DCP.



### Configuration

| Key                                     | Required | Type     | Default                           | Pattern | Min | Max | Description |
| --------------------------------------- | -------- | -------- | --------------------------------- | ------- | --- | --- | ----------- |
| `edc.oauth.provider.jwks.url`           | `*`      | `string` | `http://localhost/empty_jwks_url` |         |     |     |             |
| `edc.oauth.token.url`                   | `*`      | `string` | ``                                |         |     |     |             |
| `edc.oauth.client.id`                   | `*`      | `string` | ``                                |         |     |     |             |
| `edc.oauth.private.key.alias`           | `*`      | `string` | ``                                |         |     |     |             |
| `edc.oauth.certificate.alias`           | `*`      | `string` | ``                                |         |     |     |             |
| `edc.oauth.provider.audience`           |          | `string` | ``                                |         |     |     |             |
| `edc.oauth.validation.nbf.leeway`       | `*`      | `string` | `10`                              |         |     |     |             |
| `edc.oauth.validation.issued.at.leeway` | `*`      | `string` | `0`                               |         |     |     |             |
| `edc.oauth.endpoint.audience`           |          | `string` | ``                                |         |     |     |             |
| `edc.oauth.provider.jwks.refresh`       | `*`      | `string` | `5`                               |         |     |     |             |
| `edc.oauth.token.expiration`            | `*`      | `string` | `5`                               |         |     |     |             |
| `edc.oauth.token.resource.enabled`      | `*`      | `string` | `false`                           |         |     |     |             |

#### Provided services
- `org.eclipse.edc.spi.iam.IdentityService`

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.keys.spi.PrivateKeyResolver` (required)
- `org.eclipse.edc.keys.spi.CertificateResolver` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.iam.oauth2.spi.client.Oauth2Client` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.token.spi.TokenValidationRulesRegistry` (required)
- `org.eclipse.edc.token.spi.TokenValidationService` (required)
- `org.eclipse.edc.token.spi.TokenDecoratorRegistry` (required)
- `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider` (required)

#### Class: `org.eclipse.edc.iam.oauth2.Oauth2ServiceDefaultServicesExtension`
**Name:** "Oauth2ServiceDefaultServicesExtension"

**Overview:**  Provides OAuth2 client credentials flow support.

 @deprecated please switch to DCP.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.spi.iam.AudienceResolver`

#### Referenced (injected) services
_None_

Module `oauth2-daps`
--------------------
**Artifact:** org.eclipse.edc:oauth2-daps:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.oauth2.daps.DapsExtension`
**Name:** "DAPS"

**Overview:**  Provides specialization of Oauth2 extension to interact with DAPS instance

 @deprecated will be removed in the next versions.



### Configuration

| Key                   | Required | Type     | Default                             | Pattern | Min | Max | Description |
| --------------------- | -------- | -------- | ----------------------------------- | ------- | --- | --- | ----------- |
| `edc.iam.token.scope` | `*`      | `string` | `idsc:IDS_CONNECTOR_ATTRIBUTES_ALL` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.token.spi.TokenDecorator`

#### Referenced (injected) services
- `org.eclipse.edc.token.spi.TokenDecoratorRegistry` (required)

Module `oauth2-spi`
-------------------
**Name:** OAuth2 services
**Artifact:** org.eclipse.edc:oauth2-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.iam.oauth2.spi.client.Oauth2Client`

### Extensions
Module `policy-definition-api`
------------------------------
**Artifact:** org.eclipse.edc:policy-definition-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.policy.PolicyDefinitionApiExtension`
**Name:** "Management API: Policy Definition"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.policydefinition.PolicyDefinitionService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `policy-definition-store-sql`
------------------------------------
**Artifact:** org.eclipse.edc:policy-definition-store-sql:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.store.sql.policydefinition.store.schema.SqlPolicyStoreStatements`

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.store.sql.policydefinition.SqlPolicyStoreExtension`
**Name:** "SQL policy store"

**Overview:** No overview provided.


### Configuration

| Key                               | Required | Type     | Default   | Pattern | Min | Max | Description |
| --------------------------------- | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.policy.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.controlplane.store.sql.policydefinition.store.schema.SqlPolicyStoreStatements` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `policy-engine-spi`
--------------------------
**Name:** Policy Engine services
**Artifact:** org.eclipse.edc:policy-engine-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.policy.engine.spi.RuleBindingRegistry`
  - `org.eclipse.edc.policy.engine.spi.PolicyEngine`

### Extensions
Module `policy-monitor-core`
----------------------------
**Artifact:** org.eclipse.edc:policy-monitor-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.policy.monitor.PolicyMonitorExtension`
**Name:** "Policy Monitor"

**Overview:** No overview provided.


### Configuration

| Key                                                      | Required | Type     | Default | Pattern | Min | Max | Description |
| -------------------------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.policy.monitor.state-machine.iteration-wait-millis` | `*`      | `string` | `1000`  |         |     |     |             |
| `edc.policy.monitor.state-machine.batch-size`            | `*`      | `string` | `20`    |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.policy.monitor.spi.PolicyMonitorManager`

#### Referenced (injected) services
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)
- `org.eclipse.edc.spi.telemetry.Telemetry` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.event.EventRouter` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.contractagreement.ContractAgreementService` (required)
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessService` (required)
- `org.eclipse.edc.connector.policy.monitor.spi.PolicyMonitorStore` (required)
- `org.eclipse.edc.policy.engine.spi.RuleBindingRegistry` (required)

#### Class: `org.eclipse.edc.connector.policy.monitor.PolicyMonitorDefaultServicesExtension`
**Name:** "PolicyMonitor Default Services"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.policy.monitor.spi.PolicyMonitorStore`

#### Referenced (injected) services
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

Module `policy-monitor-store-sql`
---------------------------------
**Artifact:** org.eclipse.edc:policy-monitor-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.policy.monitor.store.sql.SqlPolicyMonitorStoreExtension`
**Name:** "SqlPolicyMonitorStoreExtension"

### Configuration

| Key                                       | Required | Type     | Default   | Pattern | Min | Max | Description |
| ----------------------------------------- | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.policy-monitor.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.policy.monitor.spi.PolicyMonitorStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.connector.policy.monitor.store.sql.schema.PolicyMonitorStatements` (optional)
- `java.time.Clock` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `policy-spi`
-------------------
**Name:** Policy services
**Artifact:** org.eclipse.edc:policy-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyArchive`
  - `org.eclipse.edc.connector.controlplane.policy.spi.store.PolicyDefinitionStore`

### Extensions
Module `protocol-version-api`
-----------------------------
**Artifact:** org.eclipse.edc:protocol-version-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.protocolversion.ProtocolVersionApiExtension`
**Name:** "Management API: Protocol Version"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.protocol.VersionService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)
- `org.eclipse.edc.spi.query.CriterionOperatorRegistry` (required)

Module `provision-http`
-----------------------
**Artifact:** org.eclipse.edc:provision-http:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.provision.http.HttpWebhookExtension`
**Name:** "HttpWebhookExtension"

**Overview:**  The HTTP Provisioner extension delegates to HTTP endpoints to perform provision operations.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.connector.controlplane.provision.http.HttpProvisionerWebhookUrl`

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessService` (required)
- `org.eclipse.edc.web.spi.configuration.context.ManagementApiUrl` (required)

#### Class: `org.eclipse.edc.connector.controlplane.provision.http.HttpProvisionerExtension`
**Name:** "HTTP Provisioning"

**Overview:**  The HTTP Provisioner extension delegates to HTTP endpoints to perform provision operations.



### Configuration

| Key                 | Required | Type     | Default            | Pattern | Min | Max | Description |
| ------------------- | -------- | -------- | ------------------ | ------- | --- | --- | ----------- |
| `provisioner.type`  | `*`      | `string` | ``                 |         |     |     |             |
| `data.address.type` | `*`      | `string` | ``                 |         |     |     |             |
| `endpoint`          | `*`      | `string` | ``                 |         |     |     |             |
| `policy.scope`      | `*`      | `string` | `http.provisioner` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ProvisionManager` (required)
- `org.eclipse.edc.policy.engine.spi.PolicyEngine` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ResourceManifestGenerator` (required)
- `org.eclipse.edc.connector.controlplane.provision.http.HttpProvisionerWebhookUrl` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.validator.spi.DataAddressValidatorRegistry` (required)

Module `secrets-api`
--------------------
**Artifact:** org.eclipse.edc:secrets-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.api.management.secret.SecretsApiExtension`
**Name:** "Management API: Secret"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.spi.service.SecretService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)

Module `sql-bootstrapper`
-------------------------
**Artifact:** org.eclipse.edc:sql-bootstrapper:0.11.1

**Categories:** _sql, persistence, storage, sql, persistence, storage_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapperExtension`
**Name:** "SQL Schema Bootstrapper Extension"

**Overview:** No overview provided.


### Configuration

| Key                         | Required | Type     | Default | Pattern | Min | Max | Description |
| --------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.sql.schema.autocreate` |          | `string` | `false` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)

Module `sql-core`
-----------------
**Artifact:** org.eclipse.edc:sql-core:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.sql.SqlCoreExtension`
**Name:** "SQL Core"

**Overview:** No overview provided.


### Configuration

| Key                  | Required | Type     | Default | Pattern | Min | Max | Description |
| -------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.sql.fetch.size` | `*`      | `string` | `5000`  |         |     |     |             |

#### Provided services
- `org.eclipse.edc.sql.QueryExecutor`
- `org.eclipse.edc.sql.ConnectionFactory`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)

Module `sql-pool-apache-commons`
--------------------------------
**Artifact:** org.eclipse.edc:sql-pool-apache-commons:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.sql.pool.commons.CommonsConnectionPoolServiceExtension`
**Name:** "Commons Connection Pool"

**Overview:** No overview provided.


### Configuration

| Key                                                    | Required | Type      | Default | Pattern | Min | Max | Description |
| ------------------------------------------------------ | -------- | --------- | ------- | ------- | --- | --- | ----------- |
| `edc.datasource.<name>url`                             | `*`      | `string`  | ``      |         |     |     |             |
| `edc.datasource.<name>user`                            | `*`      | `string`  | ``      |         |     |     |             |
| `edc.datasource.<name>password`                        | `*`      | `string`  | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connections.max-idle`       | `*`      | `int`     | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connections.max-total`      | `*`      | `int`     | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connections.min-idle`       | `*`      | `int`     | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connection.test.on-borrow`  | `*`      | `boolean` | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connection.test.on-create`  | `*`      | `boolean` | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connection.test.on-return`  | `*`      | `boolean` | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connection.test.while-idle` | `*`      | `boolean` | ``      |         |     |     |             |
| `edc.datasource.<name>pool.connection.test.query`      | `*`      | `string`  | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.spi.monitor.Monitor` (required)
- `org.eclipse.edc.sql.ConnectionFactory` (required)
- `org.eclipse.edc.spi.security.Vault` (required)

Module `sts-client-store-sql`
-----------------------------
**Artifact:** org.eclipse.edc:sts-client-store-sql:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.sts.store.SqlStsClientStoreExtension`
**Name:** "SQL sts accounts store"

**Overview:** No overview provided.


### Configuration

| Key                                  | Required | Type     | Default   | Pattern | Min | Max | Description |
| ------------------------------------ | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.stsclient.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.iam.identitytrust.sts.spi.store.StsAccountStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `org.eclipse.edc.iam.identitytrust.sts.store.schema.StsClientStatements` (optional)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `sts-server`
-------------------
**Artifact:** org.eclipse.edc:sts-server:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.identitytrust.sts.server.StsVaultSeedExtension`
**Name:** "StsVaultSeedExtension"

### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.security.Vault` (required)

Module `token-core`
-------------------
**Artifact:** org.eclipse.edc:token-core:0.11.1

**Categories:** _token, security, auth, token, security, auth_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.token.TokenServicesExtension`
**Name:** "Token Services Extension"

**Overview:**  This extension registers the {@link TokenValidationService} and the {@link TokenValidationRulesRegistry}
 which can then be used by downstream modules.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.token.spi.TokenValidationRulesRegistry`
- `org.eclipse.edc.token.spi.TokenValidationService`
- `org.eclipse.edc.token.spi.TokenDecoratorRegistry`
- `org.eclipse.edc.jwt.signer.spi.JwsSignerProvider`
- `org.eclipse.edc.jwt.validation.jti.JtiValidationStore`

#### Referenced (injected) services
- `org.eclipse.edc.keys.spi.PrivateKeyResolver` (required)

Module `token-spi`
------------------
**Name:** Token services
**Artifact:** org.eclipse.edc:token-spi:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
Module `transaction-atomikos`
-----------------------------
**Artifact:** org.eclipse.edc:transaction-atomikos:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.transaction.atomikos.AtomikosTransactionExtension`
**Name:** "Atomikos Transaction"

**Overview:**  Provides an implementation of a {@link DataSourceRegistry} and a {@link TransactionContext} backed by Atomikos.



### Configuration

| Key                                | Required | Type     | Default | Pattern | Min | Max | Description |
| ---------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `driver.class`                     | `*`      | `string` | ``      |         |     |     |             |
| `url`                              | `*`      | `string` | ``      |         |     |     |             |
| `type`                             | `*`      | `string` | ``      |         |     |     |             |
| `username`                         | `*`      | `string` | ``      |         |     |     |             |
| `password`                         | `*`      | `string` | ``      |         |     |     |             |
| `pool.size`                        | `*`      | `string` | ``      |         |     |     |             |
| `max.pool.size`                    | `*`      | `string` | ``      |         |     |     |             |
| `min.pool.size`                    | `*`      | `string` | ``      |         |     |     |             |
| `connection.timeout`               | `*`      | `string` | ``      |         |     |     |             |
| `login.timeout`                    | `*`      | `string` | ``      |         |     |     |             |
| `maintenance.interval`             | `*`      | `string` | ``      |         |     |     |             |
| `max.idle`                         | `*`      | `string` | ``      |         |     |     |             |
| `query`                            | `*`      | `string` | ``      |         |     |     |             |
| `properties`                       | `*`      | `string` | ``      |         |     |     |             |
| `edc.atomikos.timeout`             |          | `string` | ``      |         |     |     |             |
| `edc.atomikos.directory`           |          | `string` | ``      |         |     |     |             |
| `edc.atomikos.threaded2pc`         |          | `string` | ``      |         |     |     |             |
| `edc.atomikos.logging`             |          | `string` | ``      |         |     |     |             |
| `edc.atomikos.checkpoint.interval` |          | `string` | ``      |         |     |     |             |

#### Provided services
- `org.eclipse.edc.transaction.spi.TransactionContext`
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry`

#### Referenced (injected) services
_None_

Module `transaction-datasource-spi`
-----------------------------------
**Name:** DataSource services
**Artifact:** org.eclipse.edc:transaction-datasource-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry`

### Extensions
Module `transaction-local`
--------------------------
**Artifact:** org.eclipse.edc:transaction-local:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.transaction.local.LocalTransactionExtension`
**Name:** "Local Transaction"

**Overview:**  Support for transaction context backed by one or more local resources, including a {@link DataSourceRegistry}.



### Configuration_None_

#### Provided services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry`
- `org.eclipse.edc.transaction.spi.TransactionContext`

#### Referenced (injected) services
_None_

Module `transaction-spi`
------------------------
**Name:** Transactional context services
**Artifact:** org.eclipse.edc:transaction-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.transaction.spi.TransactionContext`

### Extensions
Module `transfer-data-plane-signaling`
--------------------------------------
**Artifact:** org.eclipse.edc:transfer-data-plane-signaling:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.transfer.dataplane.TransferDataPlaneSignalingExtension`
**Name:** "Transfer Data Plane Signaling Extension"

**Overview:** No overview provided.


### Configuration

| Key                                      | Required | Type     | Default  | Pattern | Min | Max | Description |
| ---------------------------------------- | -------- | -------- | -------- | ------- | --- | --- | ----------- |
| `edc.dataplane.client.selector.strategy` | `*`      | `string` | `random` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowManager` (required)
- `org.eclipse.edc.web.spi.configuration.context.ControlApiUrl` (optional)
- `org.eclipse.edc.connector.dataplane.selector.spi.DataPlaneSelectorService` (required)
- `org.eclipse.edc.connector.dataplane.selector.spi.client.DataPlaneClientFactory` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowPropertiesProvider` (optional)
- `org.eclipse.edc.connector.controlplane.transfer.spi.flow.TransferTypeParser` (required)

Module `transfer-data-plane-spi`
--------------------------------
**Name:** Transfer data plane services
**Artifact:** org.eclipse.edc:transfer-data-plane-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.transfer.dataplane.spi.security.DataEncrypter`

### Extensions
Module `transfer-process-api`
-----------------------------
**Artifact:** org.eclipse.edc:transfer-process-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.api.management.transferprocess.TransferProcessApiExtension`
**Name:** "Management API: Transfer Process"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.transform.spi.TypeTransformerRegistry` (required)
- `org.eclipse.edc.connector.controlplane.services.spi.transferprocess.TransferProcessService` (required)
- `org.eclipse.edc.validator.spi.JsonObjectValidatorRegistry` (required)

Module `transfer-process-store-sql`
-----------------------------------
**Artifact:** org.eclipse.edc:transfer-process-store-sql:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.store.sql.transferprocess.store.schema.TransferProcessStoreStatements`

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.store.sql.transferprocess.SqlTransferProcessStoreExtension`
**Name:** "SQL transfer process store"

**Overview:** No overview provided.


### Configuration

| Key                                        | Required | Type     | Default   | Pattern | Min | Max | Description |
| ------------------------------------------ | -------- | -------- | --------- | ------- | --- | --- | ----------- |
| `edc.sql.store.transferprocess.datasource` | `*`      | `string` | `default` |         |     |     |             |

#### Provided services
- `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore`

#### Referenced (injected) services
- `org.eclipse.edc.transaction.datasource.spi.DataSourceRegistry` (required)
- `org.eclipse.edc.transaction.spi.TransactionContext` (required)
- `java.time.Clock` (required)
- `org.eclipse.edc.connector.controlplane.store.sql.transferprocess.store.schema.TransferProcessStoreStatements` (optional)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.sql.QueryExecutor` (required)
- `org.eclipse.edc.sql.bootstrapper.SqlSchemaBootstrapper` (required)

Module `transfer-pull-http-dynamic-receiver`
--------------------------------------------
**Artifact:** org.eclipse.edc:transfer-pull-http-dynamic-receiver:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.receiver.http.dynamic.HttpDynamicEndpointDataReferenceReceiverExtension`
**Name:** "Http Dynamic Endpoint Data Reference Receiver"

**Overview:** No overview provided.


### Configuration

| Key                                   | Required | Type     | Default | Pattern | Min | Max | Description |
| ------------------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.receiver.http.dynamic.endpoint`  |          | `string` | ``      |         |     |     |             |
| `edc.receiver.http.dynamic.auth-key`  |          | `string` | ``      |         |     |     |             |
| `edc.receiver.http.dynamic.auth-code` |          | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.edr.EndpointDataReferenceReceiverRegistry` (required)
- `okhttp3.OkHttpClient` (required)
- `dev.failsafe.RetryPolicy<java.lang.Object>` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore` (required)
- `org.eclipse.edc.connector.controlplane.transfer.spi.observe.TransferProcessObservable` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `transfer-pull-http-receiver`
------------------------------------
**Artifact:** org.eclipse.edc:transfer-pull-http-receiver:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.controlplane.receiver.http.HttpEndpointDataReferenceReceiverExtension`
**Name:** "Http Endpoint Data Reference Receiver"

**Overview:** No overview provided.


### Configuration

| Key                           | Required | Type     | Default | Pattern | Min | Max | Description |
| ----------------------------- | -------- | -------- | ------- | ------- | --- | --- | ----------- |
| `edc.receiver.http.endpoint`  | `*`      | `string` | ``      |         |     |     |             |
| `edc.receiver.http.auth-key`  | `*`      | `string` | ``      |         |     |     |             |
| `edc.receiver.http.auth-code` | `*`      | `string` | ``      |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.connector.controlplane.transfer.spi.edr.EndpointDataReferenceReceiverRegistry` (required)
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)

Module `transfer-spi`
---------------------
**Name:** Transfer services
**Artifact:** org.eclipse.edc:transfer-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowManager`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.flow.DataFlowPropertiesProvider`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.TransferProcessManager`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.edr.EndpointDataReferenceReceiverRegistry`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.observe.TransferProcessObservable`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.TransferProcessPendingGuard`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.store.TransferProcessStore`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ProvisionManager`
  - `org.eclipse.edc.connector.controlplane.transfer.spi.provision.ResourceManifestGenerator`

### Extensions
Module `validator-data-address-http-data`
-----------------------------------------
**Artifact:** org.eclipse.edc:validator-data-address-http-data:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.validator.dataaddress.httpdata.HttpDataDataAddressValidatorExtension`
**Name:** "DataAddress HttpData Validator"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.validator.spi.DataAddressValidatorRegistry` (required)

Module `validator-data-address-kafka`
-------------------------------------
**Artifact:** org.eclipse.edc:validator-data-address-kafka:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.validator.dataaddress.kafka.KafkaDataAddressValidatorExtension`
**Name:** "DataAddress Kafka Validator"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.validator.spi.DataAddressValidatorRegistry` (required)

Module `vault-hashicorp`
------------------------
**Artifact:** org.eclipse.edc:vault-hashicorp:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.vault.hashicorp.health.HashicorpVaultHealthExtension`
**Name:** "Hashicorp Vault Health"

**Overview:** No overview provided.


### Configuration

| Key                                                 | Required | Type     | Default          | Pattern | Min | Max | Description |
| --------------------------------------------------- | -------- | -------- | ---------------- | ------- | --- | --- | ----------- |
| `edc.vault.hashicorp.url`                           | `*`      | `string` | ``               |         |     |     |             |
| `edc.vault.hashicorp.health.check.enabled`          | `*`      | `string` | `true`           |         |     |     |             |
| `edc.vault.hashicorp.api.health.check.path`         | `*`      | `string` | `/v1/sys/health` |         |     |     |             |
| `edc.vault.hashicorp.health.check.standby.ok`       | `*`      | `string` | `false`          |         |     |     |             |
| `edc.vault.hashicorp.token`                         | `*`      | `string` | ``               |         |     |     |             |
| `edc.vault.hashicorp.token.scheduled-renew-enabled` | `*`      | `string` | `true`           |         |     |     |             |
| `edc.vault.hashicorp.token.ttl`                     | `*`      | `string` | `300`            |         |     |     |             |
| `edc.vault.hashicorp.token.renew-buffer`            | `*`      | `string` | `30`             |         |     |     |             |
| `edc.vault.hashicorp.api.secret.path`               | `*`      | `string` | `/v1/secret`     |         |     |     |             |
| `edc.vault.hashicorp.folder`                        |          | `string` | ``               |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.spi.system.health.HealthCheckService` (required)
- `org.eclipse.edc.vault.hashicorp.client.HashicorpVaultClient` (required)

#### Class: `org.eclipse.edc.vault.hashicorp.HashicorpVaultExtension`
**Name:** "Hashicorp Vault"

**Overview:** No overview provided.


### Configuration

| Key                                                 | Required | Type     | Default          | Pattern | Min | Max | Description |
| --------------------------------------------------- | -------- | -------- | ---------------- | ------- | --- | --- | ----------- |
| `edc.vault.hashicorp.url`                           | `*`      | `string` | ``               |         |     |     |             |
| `edc.vault.hashicorp.health.check.enabled`          | `*`      | `string` | `true`           |         |     |     |             |
| `edc.vault.hashicorp.api.health.check.path`         | `*`      | `string` | `/v1/sys/health` |         |     |     |             |
| `edc.vault.hashicorp.health.check.standby.ok`       | `*`      | `string` | `false`          |         |     |     |             |
| `edc.vault.hashicorp.token`                         | `*`      | `string` | ``               |         |     |     |             |
| `edc.vault.hashicorp.token.scheduled-renew-enabled` | `*`      | `string` | `true`           |         |     |     |             |
| `edc.vault.hashicorp.token.ttl`                     | `*`      | `string` | `300`            |         |     |     |             |
| `edc.vault.hashicorp.token.renew-buffer`            | `*`      | `string` | `30`             |         |     |     |             |
| `edc.vault.hashicorp.api.secret.path`               | `*`      | `string` | `/v1/secret`     |         |     |     |             |
| `edc.vault.hashicorp.folder`                        |          | `string` | ``               |         |     |     |             |

#### Provided services
- `org.eclipse.edc.vault.hashicorp.client.HashicorpVaultClient`
- `org.eclipse.edc.spi.security.Vault`

#### Referenced (injected) services
- `org.eclipse.edc.http.spi.EdcHttpClient` (required)
- `org.eclipse.edc.spi.system.ExecutorInstrumentation` (required)

Module `verifiable-credentials`
-------------------------------
**Artifact:** org.eclipse.edc:verifiable-credentials:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.iam.verifiablecredentials.RevocationServiceRegistryExtension`
**Name:** "Revocation Service Extension"

**Overview:** No overview provided.


### Configuration_None_

#### Provided services
- `org.eclipse.edc.iam.verifiablecredentials.spi.model.RevocationServiceRegistry`

#### Referenced (injected) services
_None_

Module `version-api`
--------------------
**Artifact:** org.eclipse.edc:version-api:0.11.1

**Categories:** _None_

### Extension points
_None_

### Extensions
#### Class: `org.eclipse.edc.connector.api.management.version.VersionApiExtension`
**Name:** "Management API: Version Information"

**Overview:** No overview provided.


### Configuration

| Key                     | Required | Type     | Default            | Pattern | Min | Max | Description |
| ----------------------- | -------- | -------- | ------------------ | ------- | --- | --- | ----------- |
| `web.http.version.port` | `*`      | `string` | `7171`             |         |     |     |             |
| `web.http.version.path` | `*`      | `string` | `/.well-known/api` |         |     |     |             |

#### Provided services
_None_

#### Referenced (injected) services
- `org.eclipse.edc.web.spi.WebService` (required)
- `org.eclipse.edc.spi.types.TypeManager` (required)
- `org.eclipse.edc.spi.system.apiversion.ApiVersionService` (required)
- `org.eclipse.edc.web.spi.configuration.PortMappingRegistry` (required)

Module `web-spi`
----------------
**Name:** Web services
**Artifact:** org.eclipse.edc:web-spi:0.11.1

**Categories:** _None_

### Extension points
  - `org.eclipse.edc.web.spi.validation.InterceptorFunctionRegistry`
  - `org.eclipse.edc.web.spi.WebService`
  - `org.eclipse.edc.web.spi.WebServer`
  - `org.eclipse.edc.web.spi.configuration.WebServiceConfigurer`

### Extensions
