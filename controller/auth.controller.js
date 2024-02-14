import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/users.model.js";
import { Message } from "../Error/error.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
export let SignUp = asyncHandler(async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    let genSalt = await bcrypt.genSalt(10);
    if (!username || !email || !password)
      return next(Message(500, "All fields are required!"));
    let UserName = await User.findOne({ username: username });
    if (UserName) return next(Message(500, "Username already in use!"));
    let Email = await User.findOne({ email: email });
    if (Email) return next(Message(500, "Email already in use!"));
    if (!validator.isEmail(email)) return next(Message(500, "Invalid email!"));
    if (!validator.isStrongPassword(password))
      return next(Message(500, "weak password!"));
    let NewUser = await User.create({
      ...req.body,
      password: await bcrypt.hash(password, genSalt),
    });
    res.status(200).json({ data: "User created successfully!" });
  } catch (error) {
    next(error);
  }
});
export let SignIn = asyncHandler(async (req, res, next) => {
  try {
    let { username } = req.body;
    if (!username || !req.body.password)
      return next(Message(500, "All credentials are required!"));
    let Username = await User.find({
      $or: [
        {
          username: username,
        },
        {
          email: username,
        },
      ],
    });
    if (!Username[0])
      return next(Message(500, "wrong username or email-address!"));
    let Password = await bcrypt.compare(
      req.body.password,
      Username[0].password
    );
    if (!Password) return next(Message(500, "wrong username or password!"));
    let token = jwt.sign({ id: Username[0]._id }, process.env.JWT_SECRET);
    let { password, ...info } = Username[0]._doc;
    let expiresDate = new Date(Date.now() + 3600000);
    res
      .cookie("token", token, { httpOnly: true, expires: expiresDate })
      .status(200)
      .json({ data: info });
    // res.status(200).json({ data : Username})
  } catch (error) {
    next(error);
  }
});
export let LoginWithGoogle = asyncHandler(async (req, res, next) => {
  try {
    let userFound = await User.findOne({ email: req.body.email });
    if (userFound) {
      let token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET);
      let { password, ...info } = userFound._doc;
      let expiresDate = new Date(Date.now() + 3600000);
      res
        .cookie("token", token, { httpOnly: true, expires: expiresDate })
        .status(200)
        .json({ data: info });
    } else {
      let randomPassword = crypto.randomBytes(64).toString("hex");
      let genSalt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(randomPassword, genSalt);
      let newUser = await User.create({
        username: req.body.username + String(randomPassword).slice(-5),
        email: req.body.email,
        password: hashedPassword,
        image: req.body.image,
      });
      let token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      let { password, ...info } = newUser._doc;
      let expiresDate = new Date(Date.now() + 3600000);
      res
        .cookie("token", token, { expires: expiresDate })
        .status(200)
        .json({ data: info });
    }
  } catch (error) {
    next(error);
  }
});

export let Update = asyncHandler(async (req, res, next) => {
  try {
    let { username, email, profile, password } = req.body;
    if (req.user.id !== req.params.id) {
      return next(Message(500, "You can only update your own account!"));
    }
    let { id } = req.params;
    if (password) {
      let genSalt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, genSalt);
    }
    let Updated = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          username: username,
          email: email,
          password: password,
          image: profile,
        },
      },
      { new: true }
    ).select("-password");
    res.status(200).json({ data: Updated });
  } catch (error) {
    next(error);
  }
});
export let Delete = asyncHandler(async (req, res, next) => {
  try {
    let { id } = req.params;
    if (req.user.id !== id) {
      return next(Message(401, "You do not have permission to delete!"));
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ data: "Deleted successfully!" });
  } catch (error) {
    next(error);
  }
});
export let SignOut = asyncHandler(async (req, res, next) => {
  try {
    res
      .clearCookie("token")
      .status(200)
      .json({ data: "Logged out successfully!" });
  } catch (error) {
    next(error);
  }
});
