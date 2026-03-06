# The Path to Version 1 for the Eclipse Dataspace Components

The [Eclipse Dataspace Components (EDC)](https://github.com/eclipse-edc) project has evolved significantly since its initial release. What started as an experimental reference implementation for dataspace connectors has grown into a mature, modular framework used in a variety of production-grade data sharing environments.

Over the past few years, the project has continuously expanded its capabilities, aligned with emerging dataspace specifications, and improved its operational maturity. With these developments in place, the project is now approaching an important milestone: **Version 1.0**.

This blog post outlines what “Version 1” means for EDC, which milestones are currently in progress, and how these efforts shape the next phase of the project.

---

## Why Version 1?

Reaching version 1 is not about introducing a completely new generation of features. Instead, it marks the **completion of the foundational capabilities required for interoperable dataspaces**, along with stable support for the core specifications (e.g. [DSP](https://github.com/eclipse-dataspace-protocol-base/DataspaceProtocol), [DCP](https://github.com/eclipse-dataspace-dcp/decentralized-claims-protocol)) that underpin them.

The main goals of the Version 1 milestone are:

- Finalizing support for key dataspace protocols
- Consolidating architectural components developed across the ecosystem
- Aligning the APIs and operational maturity of the project
- Providing a clear baseline for adopters building dataspace infrastructures

In other words, **Version 1 represents the point where the essential building blocks of EDC are considered complete and cohesive**.

---

## Important Disclaimer

Although the release will carry a **1.0 version tag**, it **will not be a Long-Term Support (LTS) release**.

EDC Version 1 will follow the **same release and [deprecation strategy](https://github.com/eclipse-edc/docs/tree/main/developer/decision-records/2024-05-27-maturity-levels-deprecation-policy)** that applies to all other versions of the project. APIs and components may still evolve, and deprecated functionality will continue to follow the existing removal policy.

The Version 1 tag should therefore be understood primarily as a **milestone for functional completeness and ecosystem alignment**, rather than a guarantee of extended maintenance.

---

## Milestones on the Road to Version 1

Several key initiatives are currently underway to finalize the core architecture of EDC before the Version 1 release.

### Data Plane Signaling Integration

One important step is the integration of the **Data Plane Signaling specification** into the EDC data plane architecture.

The [Data Plane Signaling specification](https://projects.eclipse.org/proposals/eclipse-data-plane-signaling) defines how control planes communicate with data planes during data transfers. Integrating this specification enables:

- Standardized communication between control and data planes
- Improved interoperability between dataspace participants
- Better alignment with evolving dataspace standards

This work builds on the concepts described in our previous article about data plane signaling and brings the specification directly into the core implementation.

---

### EDC-V as the Default Capability Set

Another major step toward Version 1 is the consolidation of capabilities introduced in **[EDC-V](https://github.com/eclipse-edc/Virtual-Connector)**.

The EDC-V initiative introduced improved abstractions and architectural refinements for control planes adn their runtimes. These capabilities are now being merged with the legacy EDC repository and will become the **default capability set**.

The goal is to unify the project around a **single, modernized architecture**, simplifying both adoption and maintenance.

For users, this means:

- A consistent runtime architecture
- Reduced fragmentation between experimental and legacy components
- A clear path forward for building connectors

---

### New Management API Versions

Another milestone involves updating the management APIs.

EDC currently exposes several APIs for connector configuration and operational control. As part of the Version 1 preparation, the project will transition to **[new management API versions](https://eclipse-edc.github.io/blog/2026/02/19/management-api-upcoming-versions/)**, specifically:

- **Management API v4**
- **Management API v5**

The introduction of these versions improves:

- API consistency
- Long-term maintainability
- Alignment with the evolving EDC domain model

During the transition period, both versions will be supported to allow users to migrate gradually.

---

### EDC Maturity Assessment

Finally, the project is undergoing a formal **maturity assessment within the Eclipse Foundation ecosystem**.

The Eclipse Foundation requires projects to demonstrate governance, development processes, and ecosystem stability before they can claim higher maturity levels.

Completing the [EDC maturity assessment](https://www.eclipse.org/projects/handbook/#release-graduation) ensures that:

- Project governance and contribution processes are well established
- Documentation and development workflows meet Eclipse standards
- The project is ready for broader industry adoption

This step is an important signal that the project is moving beyond early-stage development into a **fully established open-source infrastructure project**.

---

## What Happens After Version 1?

Version 1 should be seen as a **foundation for future evolution**, not the end of the roadmap. The EDC community will continue its iterative development approach, delivering improvements in regular releases.

You want to discuss new features or even contribute your ideas? Use the discussion page of the EDC project and check our guidelines in CONTRIBUTION.md.

---

## Next Steps

Reaching Version 1 marks an important milestone for the Eclipse Dataspace Components project and its growing ecosystem.

Over the coming months, the community will continue working toward the milestones outlined above. As these pieces come together, we will get closer to officially tagging **EDC Version 1.0**.