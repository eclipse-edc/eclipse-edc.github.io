# Creation of a template repository for EDC adoption projects

## Decision

The EDC project will provide a _template repository_ for easy adoption. This template will show how to build an EDC runtime, using Hashicorp Vault and PostgreSQL persistence. It will also contain an exemplary custom extension. 

## Rationale

With the large number of modules the EDC project publishes, creating a custom launcher or app that uses them correctly
may seem like a daunting task at times.
To make it easier for adopters to get started, we'll provide a [GitHub Template Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

## Approach

The template repository will contain:
- a launcher, based on Hashicorp Vault and PostgreSQL
- minimal configuration
- a get-started guide
- some basic CI/CD workflows
- an exemplary custom extension

_For this, we will re-purpose the [Template-Basic](https://github.com/eclipse-edc/Template-Basic) repository that we already have, and that didn't really get used so far.