---
title: Federated Catalog
description: Covers how publishing and retrieving federated data catalogs works.
weight: 60
---

The Federated Catalog (FC) provides a scalable solution for metadata discovery in decentralized dataspaces. The FC employs a set of crawlers, that periodically scrape the dataspace requesting the catalog from each participant in a list of participants and consolidates them in a local cache, which provides a unified, searchable view of available data assets across the network.

Instead of requiring participants to query each other directly for catalog information, the FC uses a crawling and caching mechanism. It periodically collects catalog metadata from participant connectors and stores this information locally. By maintaining a cached copy of participant catalogs, the Federated Catalog enables faster and more reliable catalog queries while reducing network load and removing the need for real-time access to all participants during query execution. In this way, the FC effectively serves as a read-optimized replica of participant catalogs within a dataspace.

Keeping a locally cached version of every participant's catalog makes catalog queries more responsive and robust, and it can cause a reduction in network load.

The Federated Catalog is based on EDC components for core functionality, specifically those of the connector for extension loading, runtime bootstrap, configuration, API handling etc., while adding specific functionality using the EDC extensibility mechanism.

## Main components

The Federated Catalog architecture consists of two main subsystems:

1. **Federated Catalog Cache (FCC)**: responsible for crawling participant connectors and maintaining the aggregated catalog cache.

2. **Federated Catalog Node (FCN)**: hosts a participant’s catalog and responds to catalog requests issued by external crawlers.

The main features of both subsystems are summarized in the table below.

| Federated Catalog Node (FCN) | Federated Catalog Cache (FCC) |
|:-----------------------------|:-------------------------------|
| Serves a catalog to dataspace participants | Caches foreign catalog entries and their policies |
| Supports policy-based queries | Provides a query interface |
| May support multiple catalog protocols | Entries can be sent to Connector instances for retrieval |
| Pluggable storage system | May support multiple catalog protocols |
|  | Pluggable storage (schemeless) |

## Deployment considerations

The design of the crawlers aims at being ephemeral, scalable and low-maintenance. The ultimate goal is to crawl a dataspace as fast and efficiently as possible while maintaining robustness. They are relatively dumb pieces of software: when there's work, they are instantiated, they run off and crawl.

The amount of crawlers is one variable that can have great influence on the performance of the FC. When there is a lot of participants, but they rarely ever update their asset catalogs, one might get away by spawning a few crawlers, and updates would trickle in at a relatively moderate pace. Lots of participants with frequent updates to their asset catalogs might warrant the additional compute cost of spinning up many crawlers.

Another way to tweak the performance is to change the ExecutionPlan to the needs of the dataspace. Out of the box, FC supports a periodic execution, but in some dataspace there might be additional triggers such as dataspace events or even manual triggers through a web API.

## Running the Federated Catalog

The Federated Catalog is assembled from `federatedcatalog-base-bom` (crawler, query API, Management API context),
`federatedcatalog-dcp-bom` (with DCP, to authenticate to the crawled connectors) and `federatedcatalog-feature-sql-bom`
(PostgreSQL storage of the cache and of the crawl targets). The single participant control plane BOMs
(`controlplane-base-bom`, `controlplane-feature-sql-bom`) contain it too, so a connector can also act as a Federated
Catalog.

The crawler requests the catalogs as a single participant, the one configured with `edc.participant.id` (see
[Participant Contexts](../control-plane/participant-contexts/_index.md)): the Federated Catalog is not available in
multi-participant runtimes.

### Crawl targets

The connectors to crawl are the _target nodes_ of the `TargetNodeDirectory`, each with a `name`, an `id` (the
participant id of the connector), a `url` (its DSP endpoint) and its `supportedProtocols`
(`dataspace-protocol-http:2025-1`). The default directory is in memory and empty; with
`federatedcatalog-feature-sql-bom`, the targets are read from the `edc_target_node_directory` table. There is no API to
register targets: insert them into that table, or provide a `TargetNodeDirectory` of your own in an extension, e.g. one
that reads the participants of the dataspace from a registry. The node whose `name` is the runtime id is skipped.

### Crawling

Every `edc.catalog.cache.execution.period.seconds`, the crawlers request the catalog of every target node with DSP
catalog requests, page by page, including the catalogs linked from it, and replace the node's entry in the cache. A
node that can't be reached is retried, then left out until the next run; its previous entry is removed at the start of
the next run.

| Setting | Default | Description |
|---|---|---|
| `edc.catalog.cache.execution.enabled` | `true` | whether the crawlers run |
| `edc.catalog.cache.execution.period.seconds` | `60` | interval between two crawls |
| `edc.catalog.cache.execution.delay.seconds` | `0` | delay before the first crawl |
| `edc.catalog.cache.partition.num.crawlers` | `2` | number of crawlers running in parallel |
| `edc.catalog.cache.retry.retries.max` | `5` | attempts per node and crawl |
| `edc.catalog.cache.retry.delay.seconds` | `10` | delay between two attempts |
| `edc.sql.store.federatedcatalog.datasource` | `default` | datasource of the catalog cache |
| `edc.sql.store.targetnodedirectory.datasource` | `default` | datasource of the target nodes |

### Querying the cache

Clients query the cached catalogs on the Management API context, which is secured like the Management API of a single
participant runtime (see [Management API](../control-plane/management-api/_index.md)):

```http
POST /api/management/v4/catalogs/request?flatten=false
```

The optional body is a `QuerySpec` to filter the catalogs. The answer is the list of the cached DSP catalogs, as they
were at the last crawl; with `flatten=true`, the datasets of linked catalogs are returned in their parent catalog.

