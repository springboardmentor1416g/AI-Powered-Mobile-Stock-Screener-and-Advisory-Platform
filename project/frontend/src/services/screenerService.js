import { postJson } from "./http";

/**
 * Calls backend screener endpoint.
 * Assumes backend route: POST /api/v1/screener/run
 * body: { query, limit }
 */
export const screenerService = {
  async run(query, limit = 50) {
    return await postJson("/api/v1/screener/run", { query, limit });
  },
};
