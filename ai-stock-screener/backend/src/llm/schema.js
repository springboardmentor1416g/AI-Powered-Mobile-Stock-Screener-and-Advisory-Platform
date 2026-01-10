module.exports = {
  type: "object",
  properties: {
    pe: {
      type: "object",
      properties: {
        operator: { enum: ["<", ">", "<=", ">="] },
        value: { type: "number" }
      },
      required: ["operator", "value"]
    },
    promoterHolding: {
      type: "object",
      properties: {
        operator: { enum: [">", ">="] },
        value: { type: "number" }
      },
      required: ["operator", "value"]
    },
    positiveEarnings: {
      type: "boolean"
    }
  },
  additionalProperties: false
};
