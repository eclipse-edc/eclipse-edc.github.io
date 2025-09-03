---
title: PR Check List
weight: 40
---

It's recommended to submit a draft pull request early on and add people previously working on the same code as
reviewers. Make sure all automatic checks pass before marking it as "ready for review":

Before submitting a PR, please follow the steps below.

### Open a Discussion or File an Issue

Do not submit a PR without first opening an issue (if the PR resolves a bug) or creating a discussion. If a bug fix
requires a significant change or touches on critical code paths (e.g. security-related), open a discussion first.

### Coding Style

All code contributions must strictly adhere to the [Style Guide](styleguide.md) and design principles outlined in the
Contributor Technical Documentation. **PRs that do not adhere to these rules will be rejected.**

All artifacts must include the following copyright header, replacing the fields enclosed by curly brackets "{}" with
your own identifying information. (Don't include the curly brackets!) Enclose the text in the appropriate comment syntax
for the file format.

```text
Copyright (c) {year} {owner}[ and others]

This program and the accompanying materials are made available under the
terms of the Apache License, Version 2.0 which is available at
https://www.apache.org/licenses/LICENSE-2.0

SPDX-License-Identifier: Apache-2.0

Contributors:
  {name} - {description}
```

### Commit Messages

Git commit messages should comply with the following format:

```
<prefix>(<scope>): <description>
```

Use the [imperative mood](https://github.com/git/git/blob/master/Documentation/SubmittingPatches)
as in "Fix bug" or "Add feature" rather than "Fixed bug" or "Added feature" and
[mention the GitHub issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
e.g. `chore(transfer process): improve logging`.

All committers and all commits, are bound to
the [Developer Certificate of Origin.](https://www.eclipse.org/legal/DCO.php)
As such, all parties involved in a contribution must have valid ECAs. Additionally, commits can
include a ["Signed-off-by" entry](https://wiki.eclipse.org/Development_Resources/Contributing_via_Git).

### Testing and Documentation

All submissions must include extensive test coverage and be fully documented:

* Add meaningful unit tests and integration tests when appropriate to verify your submission acts as expected.
* All code must be documented. Interfaces and implementation classes must have Javadoc. Include inline documentation
  where code blocks are not self-explanatory.

