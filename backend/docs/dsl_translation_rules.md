\# DSL Translation Rules



\## Supported Metrics

\- pe\_ratio

\- revenue\_growth

\- eps\_growth

\- market\_cap



\## Operators

\- "under", "below" → <

\- "above", "over" → >



\## Logical Rules

\- Multiple conditions default to AND

\- Explicit "or" creates OR logic



\## Time Constraints

"last N quarters" →

```json

{

&nbsp; "period": {

&nbsp;   "type": "quarter",

&nbsp;   "last": N

&nbsp; }

}



