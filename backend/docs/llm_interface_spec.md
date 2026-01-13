\# LLM Integration Interface Spec



\## Endpoint

POST /api/llm/translate



\## Request

```json

{

&nbsp; "query": "Find US stocks with PE under 15 and revenue growth above 10%"

}

{

&nbsp; "dsl": {

&nbsp;   "filters": \[

&nbsp;     { "field": "pe\_ratio", "operator": "<", "value": 15 },

&nbsp;     { "field": "revenue\_growth", "operator": ">", "value": 10 }

&nbsp;   ],

&nbsp;   "logic": "AND"

&nbsp; }

}

{

&nbsp; "error": "UNSUPPORTED\_QUERY",

&nbsp; "message": "Metric not supported"

}



