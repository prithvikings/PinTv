import bcrypt from "bcrypt";
import { User } from "../models/userModel.js"; // Ensure correct import
import trycatch from "../utils/try-catch.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = trycatch(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ msg: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  generateToken(user._id, res);

  res.status(201).json({
    msg: "User registered successfully",
    user: user,
  });
});

export const loginUser = trycatch(async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ msg: "Invalid Credentials" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: "Invalid Credentials" });
  }

  generateToken(user._id, res);
  res.status(200).json({ msg: "User logged in successfully" });
});

export const myProfile = trycatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(user);
});

export const userProfile = trycatch(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.status(200).json(user);
});

export const followAndUnfollowUser = trycatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  const loggedInUser = await User.findById(req.user._id);
  if (!loggedInUser) {
    return res.status(404).json({ msg: "User not found" });
  }
  if (user._id.toString() === loggedInUser._id.toString()) {
    return res.status(400).json({ msg: "You can't follow yourself" });
  }

  if (user.followers.includes(loggedInUser._id)) {
    const indexFollowing = loggedInUser.followings.indexOf(user._id);
    const indexFollowers = user.followers.indexOf(loggedInUser._id);

    loggedInUser.followings.splice(indexFollowing, 1);
    user.followers.splice(indexFollowers, 1);

    await loggedInUser.save();
    await user.save();

    res.json({
      message: "User Unfollowed",
    });
  } else {
    loggedInUser.followings.push(user._id);
    user.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await user.save();

    res.json({
      message: "User followed",
    });
  }
});

export const logout = trycatch(async (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.json({
    message: "Logged Out Successfully",
  });
});
