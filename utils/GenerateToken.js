const jwt = require("jsonwebtoken");

const GenerateToken = (payload) =>
  jwt.sign({ id: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });

module.exports = GenerateToken;
