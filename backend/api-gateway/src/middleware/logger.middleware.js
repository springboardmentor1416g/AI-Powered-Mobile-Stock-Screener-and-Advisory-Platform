import { v4 as uuid } from "uuid";

export const requestLogger = (req, res, next) => {
  const traceId = uuid();
  req.traceId = traceId;
  console.log(`[${traceId}] ${req.method} ${req.url}`);
  next();
};
