import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Register controller
export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPass },
    });
    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userID: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default { register, login };
