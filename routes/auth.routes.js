import { Router } from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

// Register
router.post("/register", register(prisma));

// Login
router.post("/login", login(prisma));

export default router;
