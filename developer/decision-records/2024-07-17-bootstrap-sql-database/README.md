# Bootstrapping SQL databases

## Decision

The EDC project will provide functionality to automatically create database schemas for every SQL store module. This facility will be available in all components that have SQL persistence and can be globally enabled or disabled. It will be set to _disabled_ by default. 

Note that this is not a fully-fledged migration solution, as it will not provide backwards compatibility or data migration.

## Rationale

Currently, users of EDC have to come up with their very own way to create database schemas whenever they deploy a connector. While this may be acceptable (and even desired) in large-scale production environments, where dedicated database engineering teams are available that also perform data migration, it creates a considerable barrier of entry for new adopters of EDC. 
To even spin up a demo or a proof-of-concept connector that uses PostgreSQL, developers have to also find a way to create the database structure. While it is not particularly hard to do, it needlessly makes life harder in these situations. 

As an option, EDC will offer a config switch `edc.sql.schema.autocreate=true|false`, that globally enables or disables the automatic bootstrapping of the database.

## Approach

### Modular bootstrapping
If the aforementioned config switch is enabled, every SQL store module must execute all DML statements it requires, such as creating tables, creating relations etc. The use of `IF NOT EXISTS` statements is encouraged, to avoid race conditions and conflicts. 

### No incremental changes
The schema bootstrapper will attempt to execute _all_ DML scripts (as opposed to: incremental changes), and the DML scripts atomically create the entire structure.

### No built-in `DROP` statements
When the schema bootstrapper is enabled, it assumes that the database already exists. It won't create the database (permission issues), and if the database does not exist, it will fail. 
Since the DML statements will have `IF NOT EXISTS` clauses, manually dropping and recreating the database (or dropping single tables) is necessary if a complete redeployment is desired.

### Disclaimer
The schema bootstrapper is **not** a migration solution, as it does not provide data migration, incremental changes or backwards compatibility. It merely provides a simple and automated way to create database structures.

It is intended for demo and testing purposes only and must not be used in production scenarios. 

Upgrading the database from one version of EDC to the next is **not** guaranteed to work and may involve completely deleting and recreating the database.
