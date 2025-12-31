const { randomUUID } = require("crypto");

function traceMiddleware(req, res, next) {
  const traceId = req.headers["x-trace-id"] || randomUUID();

  req.traceId = traceId;

  // Set header ONCE, before response is sent
  res.setHeader("x-trace-id", traceId);

  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    // don't set headers here (avoids ERR_HTTP_HEADERS_SENT)
    // just log if you want (logger handled elsewhere)
  });

  next();
}

module.exports = traceMiddleware;
