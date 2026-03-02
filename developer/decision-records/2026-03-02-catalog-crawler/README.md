# Catalog Crawler as Control-Plane feature

## Decision
The catalog crawler implementation currently contained in the [`FederatedCatalog`](https://github.com/eclipse-edc/FederatedCatalog)
will be moved into the [`Connector`](https://github.com/eclipse-edc/Connector) repository.

## Rationale
It has been observed that the EDC `Federated Catalog` - the EDC component that provides the catalog crawling feature,
either as part of the control-plane or as a separate runtime - is lacking adoption. However, it is considered by the EDC
committer group to be one of the most crucial components in dataspace interactions.

While, for example and testing purposes, remotely retrieving catalogs from counterparties to read through contract offers
may seem like a good pattern to follow, in the context of production dataspaces with thousands of participants, this
approach could result in slowdowns in the data retrieval process and cause network overloads.

Crawling and caching catalogs locally can also enable a set of features based on more refined search queries that could
be executed repeatedly and quickly on the local dataset.

We believe this feature is underused because the `Federated Catalog` exists as a separate repository, and there are
currently no examples in which the crawling feature is embedded within a control-plane.

## Approach

All modules in the `FederatedCatalog` repository (including BOMs) will be moved into the `Connector` repository. The
`FederatedCatalog` repository will then be archived.

The catalog crawling feature will be enabled by default in the `controlplane-base-bom` module, with appropriate test
coverage and a configuration setting that will allow the crawling feature to be disabled if needed.