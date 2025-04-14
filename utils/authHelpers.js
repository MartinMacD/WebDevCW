const jwt = require("jsonwebtoken");

function getUserFromToken(req) {
  if (req.cookies && req.cookies.jwt) {
    try {
      const payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      return payload.username;
    } catch (e) {
      return null;
    }
  }
  return null;
}

module.exports = { getUserFromToken };