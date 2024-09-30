---
title: Data Persistence with PostgreSQL
weight: 30
---

<!-- TOC -->
  * [1. Configuring DataSources](#1-configuring-datasources)
    * [1.2 Using custom datasource in stores](#12-using-custom-datasource-in-stores)
  * [2. SQL Statement abstraction](#2-sql-statement-abstraction)
  * [3. Querying PostgreSQL databases](#3-querying-postgresql-databases)
    * [3.1 The canonical form](#31-the-canonical-form)
    * [3.1 Translation Mappings](#31-translation-mappings)
      * [3.1.1 Mapping primitive fields](#311-mapping-primitive-fields)
      * [3.1.2 Mapping complex objects](#312-mapping-complex-objects)
      * [Option 1: using foreign keys](#option-1-using-foreign-keys)
      * [Option 2a: encoding the object](#option-2a-encoding-the-object)
      * [Option 2b: encoding lists/arrays](#option-2b-encoding-listsarrays)
<!-- TOC -->

By default, the `in-memory` stores are provided by the dependency injection, the `sql` implementations can be used by
simply registering the relative extensions (e.g. `asset-index-sql`, `contract-negotiation-store-sql`, ...).

## 1. Configuring DataSources

For using `sql` extensions, a `DataSource` is needed, and it should be registered on the `DataSourceRegistry` service.

The `sql-pool-apache-commons` extension is responsible for creating and registering pooled data sources starting from
configuration. At least one data source named `"default"` is required.

```properties
edc.datasource.default.url=...
edc.datasource.default.name=...
edc.datasource.default.password=...
```

It is **recommended** to hold these values in the Vault rather than in configuration. The config key (e.g.
`edc.datasource.default.url`) serves as secret alias. If no vault entries are found for these keys, they will be
obtained from the configuration. This is **unsafe** and should be avoided!

Other datasources can be defined using the same settings structure:

```properties
edc.datasource.<datasource-name>.url=...
edc.datasource.<datasource-name>.name=...
edc.datasource.<datasource-name>.password=...
```

`<datasource-name>` is string that then can be used by the store's configuration to use specific data sources.

### 1.2 Using custom datasource in stores

Using a custom datasource in a store can be done by configuring the setting:

```properties
edc.sql.store.<store-context>.datasource=<datasource-name>
```

Note that `<store-context>` can be an arbitrary string, but it is recommended to use a descriptive name. For example,
the `SqlPolicyStoreExtension` defines a data source name as follows:

```java
@Extension("SQL policy store")
public class SqlPolicyStoreExtension implements ServiceExtension {

    @Setting(value = "The datasource to be used", defaultValue = DataSourceRegistry.DEFAULT_DATASOURCE)
    public static final String DATASOURCE_NAME = "edc.sql.store.policy.datasource";

    @Override
    public void initialize(ServiceExtensionContext context) {
        var datasourceName = context.getConfig().getString(DATASOURCE_NAME, DataSourceRegistry.DEFAULT_DATASOURCE);
        //...
    }
}
```

## 2. SQL Statement abstraction

EDC does not use any sort of Object-Relation-Mapper (ORM), which would automatically translate Java object graphs to SQL
statements. Instead, EDC uses pre-canned parameterized SQL statements.

We typically distinguish between literals such as table names or column names and "templates", which are SQL statements
such as `INSERT`.

Both are declared as getters in an interface that extends the `SqlStatements` interface, with literals being `default` methods and templates being implemented by a `BaseSqlDialectStatements` class.

A simple example could look like this:
```java
public class BaseSqlDialectStatements implements SomeEntityStatements {

    @Override
    public String getDeleteByIdTemplate() {
        return executeStatement().delete(getSomeEntityTable(), getIdColumn());
    }

    @Override
    public String getUpdateTemplate() {
        return executeStatement()
                .column(getIdColumn())
                .column(getSomeStringFieldColumn())
                .column(getCreatedAtColumn())
                .update(getSomeEntityTable(), getIdColumn());
    }
    //...
}
```
Note that the example makes use of the `SqlExecuteStatement` utility class, which should be used to construct all SQL
statements - _except queries_. Queries are special in that they have a highly dynamic aspect to them. For more
information, please read on in [this chapter](#3-querying-postgresql-databases).

As a general rule of thumb, issuing multiple statements (within one transaction) should be preferred over writing
complex nested statements. It is very easy to inadvertently create an inefficient or wasteful statement that causes high
resource load on the database server. The latency that is introduced by sending multiple statements to the DB server is
likely negligible in comparison, especially because EDC is architected towards reliability rather than latency.

## 3. Querying PostgreSQL databases

Generally speaking, the basis for all queries is a `QuerySpec` object. This means, that at some point a `QuerySpec` must
be translated into an SQL `SELECT` statement. The place to do this is the `SqlStatements` implementation often called
`BaseSqlDialectStatements`:

```java
@Override
public SqlQueryStatement createQuery(QuerySpec querySpec) {
    var select = "SELECT * FROM %s".formatted(getSomeEntityTable());
    return new SqlQueryStatement(select, querySpec, new SomeEntityMapping(this), operatorTranslator);
}
```

Now, there are a few things to unpack here:
- the `SELECT` statement serves as starting point for the query
- individual `WHERE` clauses get added by parsing the `filterExpression` property of the `QuerySpec`
- `LIMIT` and `OFFSET` clauses get appended based on `QuerySpec#offset` and `QuerySpec#limit`
- the `SomeEntityMapping` maps the canonical form onto the SQL literals
- the `operatorTranslator` is used to convert operators such as `=` or `like` into SQL operators

### 3.1 The canonical form

Theoretically it is possible to map every schema onto every other schema, given that they are of equal cardinality. To
achieve that, EDC introduces the notion of a _canonical form_, which is our internal working schema for entities. In
other words, this is the schema in which objects are represented internally. If we ever support a wider variety of
translation and transformation paths, everything would have to be transformed into that canonical format first.

In actuality the _canonical form_ of an object is defined by the Java class and its field names. For instance, a query
for contract negotiations must be specified using the field names of a `ContractNegotiation` object:

```java
public class ContractNegotiation {
    // ...
    private ContractAgreement contractAgreement;
    // ...
}

public class ContractAgreement {
    // ...
    private final String assetId;
}
```

Consequently, `contractAgreement.assetId` would be valid, whereas `contract_agreement.asset_id` would be invalid. Or,
the left-hand operand looks like as if we were traversing the Java object graph. This is what we call the _canonical
form_ . Note the omission of the root object `contractNegotiation`!

### 3.1 Translation Mappings

Translation mappings are EDCs way to map a `QuerySpec` to SQL statements. At its core, it contains a `Map` that contains
the Java entity field name and the related SQL column name.

In order to decouple the canonical form from the SQL schema (or any other database schema), a mapping scheme exists to
map the canonical model onto the SQL model. This `TranslationMapping` is essentially a graph-like metamodel of the
entities: every Java entity has a related mapping class that contains its field names and the associated SQL column
names. The convention is to append `*Mapping` to the class name, e.g. `PolicyDefinitionMapping`.

#### 3.1.1 Mapping primitive fields

Primitive fields are stored directly as columns in SQL tables. Thus, mapping primitive data types is trivial: a simple
mapping from one onto the other is necessary, for example, `ContractNegotiation.counterPartyAddress` would be
represented in the `ContractNegotiationMappin` as an entry

```java
"counterPartyAddress"->"counterparty_address"
```

When constructing `WHERE/AND` clauses, the canonical property is simply be replaced by the respective SQL column name.

#### 3.1.2 Mapping complex objects

For fields that are of complex type, such as the `ContractNegotiation.contractAgreement` field, it is necessary to
accommodate this, depending on how the relational data model is defined. There are two basic variants we use:

#### Option 1: using foreign keys

In this case, the referenced object is stored in a separate table using a foreign key relation. Thus, the canonical
property (`contractAgreement`) is mapped onto the SQL schema using another `*Mapping` class. Here, this would be the
`ContractAgreementMapping`. When resolving a property in the canonical format (`contractAgreement.assetId`), this means
we must recursively descend into the model graph and resolve the correct SQL expression.

> Note: mapping `one-to-many` relations (= arrays/lists) with foreign keys is not implemented at this time.

#### Option 2a: encoding the object

Another popular way to store complex objects is to encode them in JSON and store them in a `VARCHAR` column. In
PostgreSQL we use the specific `JSON` type instead of `VARCHAR`. For example, the `TranferProcess` is stored in a table
called `edc_transfer_process`, its `DataAddress` property is encoded in JSON and stored in a `JSON` field.

Querying for `TransferProcess` objects: when mapping the filter expression
`contentDataAddress.properties.somekey=somevalue`, the `contentDataAddress` is represented as JSON, therefore in the
`TransferProcessMapping` the `contentDataAddress` field maps to a `JsonFieldTranslator`:

```java
public TransferProcessMapping(TransferProcessStoreStatements statements) {
    // ...
    add(FIELD_CONTENTDATAADDRESS, new JsonFieldTranslator(statements.getContentDataAddressColumn()));
    // ...
}
```

which would then get translated to:

```sql
SELECT *
FROM edc_transfer_process
-- omit LEFT OUTER JOIN for readability
WHERE content_data_address -> 'properties' ->> 'somekey' = 'somevalue'
```

_Note that JSON queries are specific to PostgreSQL and are not portable to other database technologies!_

#### Option 2b: encoding lists/arrays

Like accessing objects, accessing lists/arrays of objects is possible using special JSON operators. In this case the
special Postgres function `json_array_elements()` is used. Please refer to the [official
documentation](https://www.postgresql.org/docs/9.5/functions-json.html).

For an example of how this is done, please look at how the `TransferProcessMapping` maps a `ResourceManifest`, which in
turn contains a `List<ResourceDefinition>` using the `ResourceManifestMapping`.
