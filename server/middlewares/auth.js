const { ObjectId } = require("mongodb");
const User = require("../models/User");
const { verifyToken } = require("../helpers/jwt");
require("dotenv").config();

async function auth(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization) throw new Error("Invalid Token");

  const [type, token] = authorization.split(" ");
  if (type !== "Bearer") throw new Error("Invalid Token");

  const payload = verifyToken(token, process.env.JWT_SECRET);
  const user = await User.getUserById(payload._id);

  if (!user) throw new Error("Invalid Token");

  return user;
}

module.exports = auth;
