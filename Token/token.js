import jwt from "jsonwebtoken";
import { Message } from "../Error/error.js";
export let verifyToken = (req, res, next) => {
  try {
    let { token } = req.cookies;
    if (!token) return next(Message(500, "login first !"));
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return next(Message(500, "session expired!"));
      req.user = payload;
      next();
    });
  } catch (error) {
    next(error);
  }
};
