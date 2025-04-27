import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  getProducts,
  addProducts,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  deleteUser,
} from "../controllers/product.controllers.js";

const router = Router();

// Get Products
router.get("/getProducts", verifyToken, getProducts);

//Add Products
router.post("/addProducts", verifyToken, addProducts);

// Update Product
router.put("/updateproduct", verifyToken, updateProduct);

// Delete Product
router.delete("/deleteProduct", verifyToken, deleteProduct);

//Delete All User Products
router.delete("/deleteAllProducts", verifyToken, deleteAllProducts);

//Delete a User
router.delete("/deleteUser", verifyToken, deleteUser);

export default router;
