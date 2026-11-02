---
title: Database Schemas
description: How the SQL schemas of the EDC runtimes are created, and how to keep them up to date between versions.
weight: 10
---

<!-- TOC -->
  * [Where the schemas come from](#where-the-schemas-come-from)
  * [Automatic schema creation](#automatic-schema-creation)
  * [Production](#production)
    * [Several replicas](#several-replicas)
  * [Upgrading](#upgrading)
<!-- TOC -->

## Where the schemas come from

Every SQL store module ships the DDL for its tables as a resource, e.g. `contract-negotiation-schema.sql` in
`contract-negotiation-store-sql`. A runtime needs the schemas of the store modules it contains, which depend on the
distribution: the `*-feature-sql-bom` BOMs, for instance, add the SQL stores of all the entities of a component. The
control plane, the IdentityHub and the issuer service each have their own set of schemas.

By default all the stores use the `default` datasource. A store can use another one with
`edc.sql.store.<store>.datasource`, e.g. `edc.sql.store.contractnegotiation.datasource`, so the schemas can be spread
over several databases.

## Automatic schema creation

With `edc.sql.schema.autocreate=true` (default: `false`), a runtime applies the schemas of all its SQL stores when it
starts, in a single transaction. The schemas are written to be applied again and again
(`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`), so this:

- creates the tables and indexes that are missing;
- doesn't change existing tables: a column added in a newer version is **not** added to a table created by an older
  one.

It is a convenience for development and testing, not a migration tool.

## Production

Create and change the schema outside the runtime:

- Apply the schema files of the store modules in your distribution, at the version you deploy, with a database user
  that is allowed to run DDL.
- Run the runtime with a user limited to `SELECT`, `INSERT`, `UPDATE` and `DELETE` (see the
  [best practices](../../../for-contributors/best-practices.md#26-use-proper-database-security)), and leave
  `edc.sql.schema.autocreate` disabled.
- Manage changes between versions with a migration tool of your choice (e.g. Flyway or Liquibase): see
  [Upgrading](#upgrading).

### Several replicas

Replicas of a runtime share its database. DDL that changes an existing table (e.g. `ALTER TABLE`) takes a lock that
waits for every transaction using the table, and all the other queries on that table queue up behind it, those of the
running replicas included. Run schema changes before rolling out the new version, e.g. as a Kubernetes `Job` or an
init step of the deployment pipeline, not from the replicas while they serve traffic.

## Upgrading

The EDC project doesn't ship migration scripts. To upgrade:

1. Find the schema changes between the version you run and the one you upgrade to: in the release changelog, or by
   comparing the schema files of the store modules, e.g. with `git diff <old tag> <new tag> -- '*-schema.sql'` in the
   EDC repositories you use.
2. Write the corresponding migration (new tables, columns, indexes) for your migration tool.
3. Apply it before deploying the new version.
