import { v4 as uuidv4 } from "uuid";

export default function requestLogger(req, res, next) {
  const traceId = uuidv4();
  req.traceId = traceId;

  console.log(`[REQ] ${traceId} ${req.method} ${req.url}`);
  next();
}
