import axios from "./client";

export const getAlerts = async () =>
  (await axios.get("/alerts")).data;

export const createAlert = async (payload: any) =>
  (await axios.post("/alerts", payload)).data;
