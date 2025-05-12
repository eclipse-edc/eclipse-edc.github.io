---
title: Policy Engine
weight: 10
---

<!-- TOC -->
  * [Policy Scopes and Bindings](#policy-scopes-and-bindings)
    * [Designing for Optimal Policy Performance](#designing-for-optimal-policy-performance)
  * [In Force Policy](#in-force-policy)
    * [Duration](#duration)
    * [Fixed Date](#fixed-date)
    * [No Period](#no-period)
    * [Not Before and Until](#not-before-and-until)
    * [Examples](#examples)
<!-- TOC -->

EDC includes a policy engine for evaluating policy expressions. It's important to understand its design center, which
takes a code-first approach. Unlike other policy engines that use a declarative language, the EDC policy engine executes
code that is contributed as extensions called *policy functions*. If you are familiar with compiler design and visitors,
you will quickly understand how the policy engine works. Internally, policy expressed as ODRL is deserialized into a
POJO-based object tree (similar to an AST) and walked by the policy engine.

Let's take one of the previous policy examples:

```json
{
  "@context": {
    "edc": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@type": "PolicyDefinition",
  "policy": {
    "@context": "http://www.w3.org/ns/odrl.jsonld",
    "@id": "8c2ff88a-74bf-41dd-9b35-9587a3b95adf",
    "duty": [
      {
        "target": "http://example.com/asset:12345",
        "action": "use",
        "constraint": {
          "leftOperand": "headquarter_location",
          "operator": "eq",
          "rightOperand": "EU"
        }
      }
    ]
  }
}
```


When the policy constraint is reached during evaluation, the policy engine will dispatch to a function registered under
the key `header_location`. Policy functions implement the `AtomicConstraintRuleFunction` interface:

```java
@FunctionalInterface
public interface AtomicConstraintRuleFunction<R extends Rule, C extends PolicyContext> {

    /**
     * Performs the evaluation.
     *
     * @param operator the operation
     * @param rightValue the right-side expression for the constraint
     * @param rule the rule associated with the constraint
     * @param context the policy context
     */
    boolean evaluate(Operator operator, Object rightValue, R rule, C context);

}
```

A function that evaluates the previous policy will look like the following snippet:

```java
public class TestPolicy implements AtomicConstraintRuleFunction<Duty, ParticipantAgentPolicyContext> {

    public static final String HEADQUARTERS = "headquarters";

    @Override
    public boolean evaluate(Operator operator, Object rightValue, Duty rule, ParticipantAgentPolicyContext context) {
        if (!(rightValue instanceof String headquarterLocation)) {
            context.reportProblem("Right-value expected to be String but was " + rightValue.getClass());
            return false;
        }

        var participantAgent = context.participantAgent();

        var claim = participantAgent.getClaims().get(HEADQUARTERS);
        if (claim == null) {
            return false;
        }
        // ... evaluate claim and if the headquarters are in the EU, return true
        return true;
    }
}
```

Note that `PolicyContext` has its own hierarchy, that's tightly bound to the policy scope.

## Policy Scopes and Bindings

In EDC, policy rules are bound to a specific context termed a *scope*. EDC defines numerous scopes, such as one for
contract negotiations and provisioning of resources. To understand how scopes work, consider the following case,
"to access data, a consumer must be a business partner in good standing":

```json
{
  "constraint": {
    "leftOperand": "BusinessPartner",
    "operator": "eq",
    "rightOperand": "active"
  }
}
```

In the above scenario, the provider EDC's policy engine should verify a partner credential when a request is made to
initiate a contract negotiation. The business partner rule must be bound to the *contract negotiation scope* since
policy rules are only evaluated for each scope they are bound to. However, validating a business partner credential
may not be needed when data is provisioned if it has already been checked when starting a transfer process. To avoid an
unnecessary check, do not bind the business partner rule to the *provision scope*. This will result in the rule being
filtered and ignored during policy evaluation for that scope.

The relationship between scopes, rules, and functions is shown in the following diagram:

![Policy Scopes](policy-scopes.svg)

Rules are bound to scopes, and unbound rules are filtered when the policy engine evaluates a particular scope. Scopes
are bound to contexts, and functions are bound to rules *for a particular scope/context*. This means that separate
functions can be associated with the same rule in different scopes. Furthermore, both scopes and contexts are hierarchical
and denoted with a `DOT` notation. A rule bound to a parent context will be evaluated in child scopes.

### Designing for Optimal Policy Performance

Be careful when implementing policy functions, particularly those bound to the catalog request scope (`request.catalog`),
which may involve evaluating a large set of policies in the course of a synchronous request. Policy functions should be
efficient and avoid unnecessary remote communication. When a policy function makes a database call or invokes a
back-office system (e.g., for a security check), consider introducing a caching layer to improve performance if testing
indicates the function may be a bottleneck. This is less of a concern for policy scopes associated with asynchronous
requests where latency is generally not an issue.

## In Force Policy

The InForce is an interoperable policy for specifying in force periods for contract agreements. An in force period can
be defined as a __duration__ or a __fixed date__.
All dates must be expressed as UTC.

### Duration

A duration is a period of time starting from an offset. EDC defines a simple expression language for specifying the
offset and duration in time units:

```<offset> + <numeric value>ms|s|m|h|d```

The following values are supported for `<offset>`:

| Value             | Description                                                                                                                           |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| contractAgreement | The start of the contract agreement defined as the timestamp when the provider enters the AGREED state expressed in UTC epoch seconds |

The following values are supported for the time unit:

| Value | Description  |
|-------|--------------|
| ms    | milliseconds |
| s     | seconds      |
| m     | minutes      |
| h     | hours        |
| d     | days         |

A duration is defined in a `ContractDefinition` using the following policy and left-hand
operands `https://w3id.org/edc/v0.0.1/ns/inForceDate`:

```json
{
  "@context": {
    "cx": "https://w3id.org/cx/v0.8/",
    "@vocab": "http://www.w3.org/ns/odrl.jsonld"
  },
  "@type": "Offer",
  "@id": "a343fcbf-99fc-4ce8-8e9b-148c97605aab",
  "permission": [
    {
      "action": "use",
      "constraint": {
        "and": [
          {
            "leftOperand": "https://w3id.org/edc/v0.0.1/ns/inForceDate",
            "operator": "gt",
            "rightOperand": {
              "@value": "contractAgreement",
              "@type": "https://w3id.org/edc/v0.0.1/ns/inForceDate:dateExpression"
            }
          },
          {
            "leftOperand": "https://w3id.org/edc/v0.0.1/ns/inForceDate:inForceDate",
            "operator": "lt",
            "rightOperand": {
              "@value": "contractAgreement + 100d",
              "@type": "https://w3id.org/edc/v0.0.1/ns/inForceDate:dateExpression"
            }
          }
        ]
      }
    }
  ]
}
```

### Fixed Date

Fixed dates may also be specified as follows using `https://w3id.org/edc/v0.0.1/ns/inForceDate` operands:

```json
{
  "@context": {
    "edc": "https://w3id.org/edc/v0.0.1/ns/inForceDate",
    "@vocab": "http://www.w3.org/ns/odrl.jsonld"
  },
  "@type": "Offer",
  "@id": "a343fcbf-99fc-4ce8-8e9b-148c97605aab",
  "permission": [
    {
      "action": "use",
      "constraint": {
        "and": [
          {
            "leftOperand": "https://w3id.org/edc/v0.0.1/ns/inForceDate",
            "operator": "gt",
            "rightOperand": {
              "@value": "2023-01-01T00:00:01Z",
              "@type": "xsd:datetime"
            }
          },
          {
            "leftOperand": "https://w3id.org/edc/v0.0.1/ns/inForceDate",
            "operator": "lt",
            "rightOperand": {
              "@value": "2024-01-01T00:00:01Z",
              "@type": "xsd:datetime"
            }
          }
        ]
      }
    }
  ]
}
```

Although `xsd:datatime` supports specifying timezones, UTC should be used. It is an error to use an `xsd:datetime`
without specifying the timezone.

### No Period

If no period is specified the contract agreement is interpreted as having an indefinite in force period and will remain
valid until its other constraints evaluate to false.

### Not Before and Until

`Not Before` and `Until` semantics can be defined by specifying a single `https://w3id.org/edc/v0.0.1/ns/inForceDate`
fixed date constraint and an
appropriate operand. For example, the following policy
defines a contact is not in force before `January 1, 2023`:

 ```json
{
  "@context": {
    "edc": "https://w3id.org/edc/v0.0.1/ns/",
    "@vocab": "http://www.w3.org/ns/odrl.jsonld"
  },
  "@type": "Offer",
  "@id": "a343fcbf-99fc-4ce8-8e9b-148c97605aab",
  "permission": [
    {
      "action": "use",
      "constraint": {
        "leftOperand": "edc:inForceDate",
        "operator": "gt",
        "rightOperand": {
          "@value": "2023-01-01T00:00:01Z",
          "@type": "xsd:datetime"
        }
      }
    }
  ]
}
```

### Examples

- In-force policy with a fixed validity: [policy.inforce.fixed.json](./policy.inforce.fixed.json)
- In-force policy with a relative validity duration: [policy.inforce.duration.json](./policy.inforce.duration.json)

_Please note that the samples use the abbreviated prefix notation `"edc:inForceDate"` instead of the full namespace 
`"https://w3id.org/edc/v0.0.1/ns/inForceDate"`._
