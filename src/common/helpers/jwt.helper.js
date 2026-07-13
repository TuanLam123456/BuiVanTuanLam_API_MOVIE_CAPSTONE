import jwt from "jsonwebtoken";
import {
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET,
} from "../constants/app.constant.js";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "3h" });
};

export const verifyAccessToken = (token, options) => {
  return jwt.verify(token, JWT_SECRET_KEY, options);
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
