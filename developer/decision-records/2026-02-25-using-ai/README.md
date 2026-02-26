# Using AI in EDC development

## Decision

In an effort to keep triage efforts reasonable, we will introduce a new label `ai` that committers may attach to any contribution that gives the strong appearance of being largely AI-generated.

Contributions (issues, discussions, pull-requests) labelled `ai` may get rejected and/or closed without further justification.

## Rationale

We are aware of the global advance of Artificial Intelligence and its pervasive nature in the field of software development and associated fields. Some of us even us it in our everyday lives, so we are in no way _against_ using AI in general.

EDC is a very complex piece of software, so a fundamental understanding of its inner workings is necessary in order to write good code, even if AI is used to assist in some of the actual development tasks. AI makes mistakes, which means humans are still required to carefully review its output.

Again, this is not the EDC project banning AI flat-out, but to establish boundaries and guidelines on its usage. As with all things, the dosage makes the poison and thus we must establish guards against over-using AI or using it blindly in the context of EDC. At the very least we expect contributors to parse, fact-check and sanitize AI output before submitting it to the EDC project.

While triaging issues, reviewing PRs and answering discussions is part of our (the committers') day-to-day work, it is a very time consuming task. And that time consumption turns into a plain waste of time as soon as contributions are largely AI-generated and contain avoidable mistakes and errors.

It remains at the committers' discretion to mark suspicious contributions as `ai` and in further consequence close/ignore/reject the contribution without further justification.

## Approach

We will add a section to our contribution guidelines essentially stating the following, plus also referencing the Eclipse Foundation's [recommendation](https://www.eclipse.org/projects/handbook/#genai) on generative AI.

There is no 100% reliable way to identify AI content, but there usually are certain tells. If a committer suspects a certain contribution of being largely AI-generated, they may assign the `ai` label to the contribution.

Original authors are free to dispute the assessment, at which point they and the committers must come to an agreement. If none is reached, it remains at the committers' discretion to uphold the assessment or remove it.

In further consequence, the committers may either reject/close those contributions outright, or the EDC project may implement an automated way to periodically reject/close those contributions.

Contributors who repeatedly submit largely AI-generated content may be _banned_ either temporarily or in grave cases even permanently.
