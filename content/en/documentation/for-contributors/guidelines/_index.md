---
title: Contribution Guidelines
linkTitle: Guidelines
weight: 900
---

Thank you for your interest in the EDC! This document provides guidelines and steps members are asked to follow when
contributing to the project.

<!-- TOC -->
  * [Code Of Conduct](#code-of-conduct)
  * [How to Contribute](#how-to-contribute)
    * [Creating an Issue](#creating-an-issue)
    * [Submitting a Pull Request](#submitting-a-pull-request)
      * [Eclipse Contributor Agreement](#eclipse-contributor-agreement)
    * [Stale Issues and PRs](#stale-issues-and-prs)
    * [Reporting Flaky Tests](#reporting-flaky-tests)
  * [Non-Code Contributions](#non-code-contributions)
  * [Project and Milestone Planning](#project-and-milestone-planning)
    * [Milestones](#milestones)
      * [Issues](#issues)
      * [Pull Requests](#pull-requests)
    * [Projects](#projects)
  * [Contact Us](#contact-us)
<!-- TOC -->

## Code Of Conduct

All community members are expected to adhere to
the [Eclipse Code of Conduct](https://www.eclipse.org/org/documents/Community_Code_of_Conduct.php").

## How to Contribute

If you want to share a feature idea or discuss a potential use case, first check the existing issues and discussions to
see if it has already been raised. If not, open a discussion (not an issue).

- For specific technology topics, use [GitHub discussions](https://github.com/features/discussions)
  in the appropriate repository.
- For general topics (including project planning, relationship to other projects, etc.) use the [EDC
  organization discussions](https://github.com/orgs/eclipse-edc/discussions).
- To get a list of issues whereas a new contributor you can contribute to, please take a look at
  [this page](https://github.com/search?q=org%3Aeclipse-edc+label%3A%22good+first+issue%22+state%3Aopen&type=issues&ref=advsearch). 

### Creating an Issue

If you have identified a bug first check the existing issues to see if it has already been identified. If not, create
a new issue in the appropriate GitHub repository. Keep in mind the following:

- We
  use [GitHub's default label set](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
  extended by custom ones to classify issues and improve findability.
- If an issue appears to cover changes that will significantly impact the codebase, open a discussion before creating an
  issue.
- If an issue covers a topic or the response to a question that may be interesting for further discussion, it should be
  converted to a discussion instead of being closed.

### Submitting a Pull Request

Before submitting code to EDC, you should complete the following prerequisites:

* **DO NOT** submit a PR without first filing an issue (bug) or opening a discussion (new feature).
* Have a thorough understanding of the EDC codebase, including all technical documentation and Decision Records in the
  relevant repositories.
* Review the [Eclipse Project Handbook](https://www.eclipse.org/projects/handbook/#contributing).
* Review the [EDC Pull-Request Etiquette](pr-etiquette).
* Follow the [EDC Pull-Request Checklist](pr-checklist).

#### Eclipse Contributor Agreement

Before your contribution can be accepted by the project, you need to create and electronically sign
an [Eclipse Contributor Agreement (ECA)](http://www.eclipse.org/legal/ecafaq.php):

1. Log in to the [Eclipse foundation website](https://accounts.eclipse.org/user/login/). You will
   need to create an account within the Eclipse Foundation if you have not already done so.
2. Click on "Eclipse ECA", and complete the form.

Be sure to use the same email address in your Eclipse Account that you intend to use when committing to GitHub.


### Stale Issues and PRs

In order to keep our backlog clean, EDC uses a bot that labels and closes old issues and PRs. The following table
outlines this process:

|                        | Stale After | Closed After Stale |
|:-----------------------|------------:|-------------------:|
| Issue without assignee |     14 days |             7 days |
| Issue with assignee    |     28 days |             7 days |
| PR                     |      7 days |             7 days |

Note that updating an issue, for example by commenting, will remove the `stale` label and reset the counters. However,
we ask the community **not to abuse** this feature (e.g., periodically commenting "what's the status?" would qualify as
abuse). If an issue receives no attention, usually there are reasons for it. To avoid closed issues, it's recommended to
clarify in advance whether a feature fits into the project roadmap by opening a discussion, which are not automatically
closed.

### Reporting Flaky Tests

If you discover a randomly failing ("flaky") test, please check whether an issue for that already
exists. If not, create one, making sure to provide a meaningful description and a link to the failing run. Also include
the `Bug` and `FlakyTest` labels and assign it to an author of the relevant code. If assigning the issue is not
possible due to missing rights, just comment and @mention the author/last editor.

Be sure not restart the run, as this will overwrite the results. Instead, push an empty commit to trigger another run.

```bash
git commit --allow-empty -m "trigger CI" && git push
```

Note that issues labeled with `Bug` and `FlakyTest` are prioritized.

## Non-Code Contributions

Non-code contributions are another valued way to contribute. Examples include:

- Evangelizing EDC
    - Helping to develop the community by hosting events, meetups, summits, and hackathons
- Community education
    - Answering questions on GitHub, Discord, etc.
    - Writing documentation
    - Other writing (Blogs, Articles, Interviews)

## Project and Milestone Planning

We use milestones to set a common focus for a period of 6 to 8 weeks. The group of committers chooses issues based on
customer needs and contributions we expect.

### Milestones

Milestones are organized at the [GitHub Milestones page](https://github.com/eclipse-edc/Connector/milestones).
They are numbered in ascending order. There, contributors, users, and adopters can track the progress.

Please note that the due date of a milestone does not imply any guarantee that all linked issued will
be resolved by then.

When closing the current milestone, issues that were not resolved within a milestone phase will be
reviewed to evaluate their relevance and priority, before being assigned to the next milestone.

#### Issues

Every issue that should be addressed during a milestone phase is assigned to it by using the
`Milestone` feature for linking both items. This way, the issues can easily be filtered by
milestones.

#### Pull Requests

Pull requests are not assigned to milestones as their linking to issues is sufficient to track
the relations and progresses.

### Projects

The [GitHub Projects page](https://github.com/eclipse-edc/Connector/projects)
provides a general overview of the project's working items. Every new issue is automatically assigned
to the ["Dataspace Connector" project](https://github.com/orgs/eclipse-edc/projects/3).
It can be unassigned or moved to any other project that is provided.

In every project, an issue passes four stages: `Backlog`, `In progress`, `Review in progress`, and `Done`,
independent of their association to a specific milestone.

## Contact Us

If you have questions or suggestions, do not hesitate to contact the project developers via
the [project's "dev" list](https://dev.eclipse.org/mailman/listinfo/edc-dev). You may also want to join
our [Discord server](https://discord.gg/n4sD9qtjMQ).

The project holds a biweekly meeting on fridays 2-3 p.m. (CET) to give community members the
opportunity to get in touch with the committer team. We meet in the "general" voice channel.
Schedule details are [on GitHub](https://github.com/eclipse-edc/Connector/discussions/1303).

_If you have a "contributor" or "committer" status, you will also have access to private channels._
