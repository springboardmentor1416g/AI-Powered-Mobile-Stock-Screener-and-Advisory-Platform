
---

# 3️⃣ LLM Stub Implementation  
📄 **File:** `/services/llm_stub/llm_stub.py`

```python
import json

class LLMStub:
    def __init__(self):
        with open("services/llm_stub/stub_responses.json") as f:
            self.responses = json.load(f)

    def translate(self, nl_query: str):
        nl_query = nl_query.lower().strip()
        if nl_query in self.responses:
            return {
                "status": "success",
                "dsl": self.responses[nl_query]
            }
        return {
            "status": "failed",
            "error": "Unsupported or ambiguous query"
        }
