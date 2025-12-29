import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check empty input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(httpStatus.OK).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error}` });
  }
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error}` });
  }
};

export { login, register };
