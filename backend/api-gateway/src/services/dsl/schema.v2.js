/**
 * DSL v2 structure
 */
module.exports = {
  type: "object",
  required: ["conditions"],
  properties: {
    conditions: {
      type: "array",
      items: {
        oneOf: [
          { $ref: "#/definitions/simple" },
          { $ref: "#/definitions/range" },
          { $ref: "#/definitions/temporal" },
          { $ref: "#/definitions/logical" }
        ]
      }
    }
  },

  definitions: {
    simple: {
      required: ["field", "operator", "value"],
      properties: {
        field: { type: "string" },
        operator: { enum: ["<", "<=", ">", ">=", "="] },
        value: { type: "number" }
      }
    },

    range: {
      required: ["field", "between"],
      properties: {
        field: { type: "string" },
        between: {
          type: "array",
          items: { type: "number" },
          minItems: 2,
          maxItems: 2
        }
      }
    },

    temporal: {
      required: ["field", "operator", "value", "window"],
      properties: {
        field: { type: "string" },
        operator: { enum: [">", "<", ">=", "<="] },
        value: { type: "number" },
        window: {
          required: ["period", "count"],
          properties: {
            period: { enum: ["quarter", "year"] },
            count: { type: "number" }
          }
        },
        aggregation: { enum: ["ALL", "ANY", "TREND"] }
      }
    },

    logical: {
      required: ["logic", "conditions"],
      properties: {
        logic: { enum: ["AND", "OR"] },
        conditions: { type: "array" }
      }
    }
  }
};
