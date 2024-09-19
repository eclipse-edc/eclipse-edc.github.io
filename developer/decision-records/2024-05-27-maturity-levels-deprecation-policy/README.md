# EDC Maturity Levels and Deprecation Policy

## Decision

The EDC project will adopt the API Maturity Levels and Deprecation Policy (MLDP) specified in this decision record.

## Rationale

Defining API maturity levels and a deprecation policy will better enable EDC users and downstream projects to plan when to adopt and migrate from specific EDC API versions. The rules and maturity levels are inspired by the [Kubernetes Deprecation Policy](https://kubernetes.io/docs/reference/using-api/deprecation-policy/)

## Impact

The MLDP will dictate the lifecycle of all EDC APIs. However, it will not alter EDC's milestone-based release process nor will it introduce the notion of a Long-Term Support (LTS) version. Rather, the MLDP is designed to allow the EDC project to continue with its frequent release schedule while improving planning opportunities for downstream projects. Note that these rules do not apply to EDC SPIs.

## Maturity Level

As detailed in the [Consistent Versioning of External APIs Decision Record](https://github.com/eclipse-edc/docs/tree/main/developer/decision-records/2024-05-20-api-versioning-2), EDC APIs are organized into individually versioned groups or "contexts." Each group version will have one of the following assigned maturity levels:

- ***Alpha***: The API is experimental, not extensively tested, and may be changed without notice. 
- ***Beta***: The API is complete, tested, and ready for development use, but may be changed with notice. 
- ***GA***: Generally available, the API is stable and ready for production use. Breaking changes will only be done with major releases.

APIs with  *beta* maturity level will indicate this level in the URL version scheme along with a monotonically increasing number. The *GA* maturity level will use the simple version scheme. For example:

| Version  | Maturity |
| -------- | -------- |
| v1alpha  | Alpha    |
| v1beta1  | Beta     |
| v1       | GA       |


## Deprecation Rules

Deprecation rules are enforced for official releases, not individual commits, and are tied to the maturity level of an API.

### Rule 1: API elements may only be removed by incrementing the version of the API group.

API elements may only be removed by incrementing the API group version number, regardless of maturity level. For example, if a POST method is deleted or renamed and the current version is `v1beta1`, the next release must be labeled `v1beta2` (or `v1`). Alpha releases are exempt from this rule.

### Rule 2: API objects must round-trip. 

API objects must round-trip between API versions in a given release without information loss, with the exception of resources that do not exist in some versions.

### Rule 3: An API version may not be replaced by a less stable API version.

- GA API versions can replace beta and alpha API versions.
- Beta API versions can replace earlier beta and alpha API versions, but may not replace GA API versions.
- Alpha API versions can replace earlier alpha API versions, but may not replace GA or beta API versions.

### Rule 4: API lifetime is determined by the API stability level 

- GA API versions may be marked as deprecated when a new GA version is available, but must not be removed within two major versions of EDC.
- GA API versions are removed no less that 3 months after deprecation. The minimum lifetime of an API version is therefore 18 weeks.
- Beta API versions may be marked as deprecated when a subsequent beta version is made available.
- Beta API versions are removed no less than 6 weeks after deprecation if one subsequent beta version is available or if two subsequent beta versions have been made available.
- Beta API versions may be removed if a GA version is made available. 
- Alpha API versions may be removed in any release without prior deprecation notice.

### Rule 5: There may be exceptions to the above rules

For example, a major security vulnerability could dictate removal of a GA or beta API.

### Examples

The following table illustrates the above rules:

| Release | API Versions                        | Notes                                                                                                                          |
| ------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| X.0     | v1, v2alpha                         |                                                                                                                                |
| X.1     | v1, v2alpha                         | v2alpha can be changed                                                                                                         |
| X.2     | v1.1 v2beta1                        | v1.1 is backward-compatible with v1                                                                                            |
| X.3     | v1,.1 v2beta1 (deprecated), v2beta2 |                                                                                                                                |
| X.4     | v1.1 v2beta2 (deprecated), v2beta3  | v2beta2 can be removed even if X.4 is released less than 6 weeks after X.3 because two subsequent beta versions are available. |
| Y.0     | v1.1 (deprecated), v2               |                                                                                                                                |
| Y.1     | v1.1 (deprecated), v2.1             |                                                                                                                                |
| Z.0     | v2.1                                | Z.0 must be released at least 3 months after Y.0.                                                                              |
