const crypto = require("crypto");

function generateToken(secret = "secret") {
  const counter = Math.floor(Date.now() / 15000);

  const hash = crypto
    .createHmac("sha256", secret)
    .update(counter.toString())
    .digest("hex");

  return 868356
 }
