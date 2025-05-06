import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import { PrismaClient } from "@prisma/client";
import {
  getProducts,
  addProducts,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  deleteUser,
} from "../controllers/product.controllers.js";

const router = Router();
const prisma = new PrismaClient();

// Get Products
router.get("/getProducts", verifyToken, getProducts(prisma));

//Add Products
router.post("/addProducts", verifyToken, addProducts(prisma));

// Update Product
router.put("/updateProduct", verifyToken, updateProduct(prisma));

// Delete Product
router.delete("/deleteProduct", verifyToken, deleteProduct(prisma));

//Delete All User Products
router.delete("/deleteAllProducts", verifyToken, deleteAllProducts(prisma));

//Delete a User
router.delete("/deleteUser", verifyToken, deleteUser(prisma));

export default router;
