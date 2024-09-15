---
title: Pull Request Etiquette
linkTitle: PR Etiquette
weight: 20
---
## Authors

PRs should adhere to the following rules.

- Familiarize yourself with [coding style](./styleguide.md), [./architectural patterns](coding-principles.md),
  and other contribution guidelines.
- No surprise PRs. Before submitting a PR, open a discussion or an issue outlining the planned work and give
  people time to comment. Unsolicited PRs may get ignored or rejected.
- Create focused PRs. Work should be focused on one particular feature or bug. Do not create broad-scoped PRs that
  solve multiple issues or span signficant portions of the codebase as they will be rejected outright.
- Provide a clear PR description and motivation. This makes the reviewer's life much
  easier. It is also helpful to outline the broad changes that were made, e.g. "Changes the schema of XYZ-Entity:
  the `age` field changed from `long` to `String`".
- If 3rd party dependencies are introduced, note them in the PR description and explain why they are necessary.
- Stick to the established code style, please refer to
  the [styleguide document](./styleguide.md).
- All tests should be green, especially when your PR is in `"Ready for review"`
- Mark PRs as `"Ready for review"` only when the PR is complete. No additional commits should be pushed other than to
  incorporate review comments.
- Merge conflicts should be resolved by squashing all commits on the PR branch, rebasing onto `main,` and
  force-pushing. Do this when your PR is ready to review.
- If you require a reviewer's input while it's still in draft, please contact the designated reviewer using
  the `@mention` feature and let them know what you'd like them to look at.
- Request a review from one of the [technical committers](pr_etiquette.md#the-technical-committers). Requesting a review
  from anyone else is still possible, and
  sometimes may be advisable, but only committers can merge PRs, so be sure to include them early on.
- Re-request reviews after all remarks have been adopted. This helps reviewers track their work in GitHub.
- If you disagree with a committer's remarks, feel free to object and argue, but if no agreement is reached, you'll have
  to either accept the committer's decision or withdraw your PR.
- Be civil and objective. No foul language, insulting or otherwise abusive language will be tolerated.
- The PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
    - The title must follow the format as `<type>(<optional scope>): <description>`.
      `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test` are allowed for the
      `<type>`.
    - The length must be kept under 80 characters.
    -
  See [check-pull-request-title job of GitHub workflow](https://github.com/eclipse-edc/.github/blob/main/.github/workflows/scan-pull-request.yml)
  for checking details.

## Reviewers

- Please complete reviews within two business days or delegate to another committer, removing yourself as a reviewer.
- If you have been requested as reviewer, but cannot do the review for any reason (time, lack of knowledge in particular
  area, etc.) please comment that in the PR and remove yourself as a reviewer, suggesting a stand-in. The **CODEOWNERS**
  document
  should help with that.
- Don't be overly pedantic.
- Don't argue basic principles (code style, architectural decisions, etc.)
- Use the `suggestion` feature of GitHub for small/simple changes.
- The following could serve you as a review checklist:
    - No unnecessary dependencies in `build.gradle.kts`
    - Sensible unit tests, prefer unit tests over integration tests wherever possible (test runtime). Also check the
      usage of test tags.
    - Code style
    - Simplicity and "uncluttered-ness" of the code
    - Overall focus of the PR
- Don't just wave through any PR. Please take the time to look at them carefully.
- Be civil and objective. No foul language, insulting or otherwise abusive language will be tolerated. The goal is to
  _encourage_ contributions.

## The technical committers

_(as of Sept 15, 2024)_

- @wolf4ood
- @jimmarino
- @bscholtes1A
- @ndr_brt
- @ronjaquensel
- @juliapampus
- @paullatzelsperger
