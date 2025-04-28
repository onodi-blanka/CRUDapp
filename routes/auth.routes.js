import { Router } from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { prisma } from "../db/prisma.js";

const router = Router();

// Register
router.post("/register", register(prisma));

// Login
router.post("/login", login(prisma));

export default router;
