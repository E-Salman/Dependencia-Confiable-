const crypto = require("crypto");

function generateToken(secret = "default-secret") {
  const timeWindow = Math.floor(Date.now() / 30000);

const hash = crypto
.createHmac("sha256", secret)
    .update(timeWindow.toString())
.digest("hex");

  // Convert hex -> 6 digit code
  const token = parseInt(hash.substring(0, 8), 16)
    .toString()
    .substring(0, 6);

  return token.padStart(6, "0");
}

module.exports = {
  generateToken
};
