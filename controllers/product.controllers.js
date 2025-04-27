import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get Products controller
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.id },
    });
    if (products.length == 0) {
      return res.status(400).json({ message: "Empty products list" });
    }
    res.json(products);
  } catch {
    res
      .status(500)
      .json({ message: "There was an error while fetching the products" });
  }
};

//Add Products Controller
export const addProducts = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Product name required" });
  }
  const existingProduct = await prisma.product.findFirst({
    where: {
      name: name,
      userId: req.user.id,
    },
  });
  if (existingProduct) {
    return res.status(400).json({ message: "Product is already added" });
  }
  try {
    const newProduct = await prisma.product.create({
      data: { name, user: { connect: { id: req.user.id } } },
    });
    res
      .status(200)
      .json({ message: "The product was added", product: newProduct });
  } catch {
    res
      .status(500)
      .json({ message: "There was an error while adding the product" });
  }
};

//Delete Product Controller
export const deleteProduct = async (req, res) => {
  const { name } = req.body;
  const productToBeDeleted = await prisma.product.findFirst({
    where: {
      name: name,
      userId: req.user.id,
    },
  });
  if (!productToBeDeleted) {
    return res
      .status(400)
      .json({ message: "Product is not in the product list" });
  }
  try {
    const deleteProduct = await prisma.product.delete({
      where: { id: productToBeDeleted.id },
    });
    res.status(200).json({
      message: `Product '${deleteProduct.name}' was deleted successfully`,
    });
  } catch {
    res
      .status(500)
      .json({ message: "There was an error while deleting the product" });
  }
};

//Delete All User Products Controller
export const deleteAllProducts = async (req, res) => {
  const existingProducts = await prisma.product.findMany({
    where: { userId: req.user.id },
  });

  if (existingProducts.length === 0) {
    return res.status(400).json({ message: "Product list is empty" });
  }
  try {
    const deleteProducts = await prisma.product.deleteMany({
      where: { userId: req.user.id },
    });
    res.status(200).json({
      message: "All products were deleted successfully",
      deleteProducts,
    });
  } catch {
    res
      .status(500)
      .json({ message: "There was an error while deleting all products" });
  }
};

//Update Product Controller
export const updateProduct = async (req, res) => {
  const { name, newName } = req.body;
  if (!name || !newName) {
    return res.status(400).json({ message: "Product name required" });
  }

  try {
    const updatingProduct = await prisma.product.findFirst({
      where: {
        name: name,
        userId: req.user.id,
      },
    });
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: newName,
        userId: req.user.id,
      },
    });
    if (existingProduct) {
      return res.status(400).json({ message: "Product is already added" });
    }
    if (!updatingProduct) {
      return res.status(400).json({ message: "Product not found" });
    }
    const updateProduct = await prisma.product.update({
      where: { id: updatingProduct.id },
      data: { name: newName },
    });
    res.status(200).json({
      message: `Product '${updateProduct.name}' was updated successfully`,
    });
  } catch {
    res
      .status(500)
      .json({ message: "There was an error while updating the product" });
  }
};

//Delete User Controller
export const deleteUser = async (req, res) => {
  const { email } = req.body;
  try {
    const userToBeDeleted = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!userToBeDeleted) {
      return res.status(400).json({ message: "User not found" });
    }
    const deleteUser = await prisma.user.delete({
      where: { email: email },
    });
    res.status(200).json({
      message: `User '${deleteUser.email}' was deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: "There was an error while deleting the user",
      error: error.message,
    });
  }
};
