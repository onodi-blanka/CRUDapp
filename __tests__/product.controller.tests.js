import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  addProducts,
  getProducts,
  deleteProduct,
  deleteAllProducts,
  updateProduct,
  deleteUser,
} from "../controllers/product.controllers";
import e from "express";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("@prisma/client", () => {
  return {
    Prisma: jest.fn().mockImplementation(() => ({
      product: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    })),
  };
});

const prismaMock = new Prisma();

describe("Get Products Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and all products", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = [
      { id: 1, name: "Product 1", userId: 1 },
      { id: 2, name: "Product 2", userId: 1 },
    ];
    prismaMock.product.findMany.mockResolvedValue(mockProduct);
    await getProducts(prismaMock)(req, res);

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });

  it("should return 400 if products list is empty", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findMany.mockResolvedValue([]);
    await getProducts(prismaMock)(req, res);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Empty products list",
    });
  });
  it("should throw 500 if there is an error", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findMany.mockRejectedValue(new Error("Error"));
    await getProducts(prismaMock)(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "There was an error while fetching the products",
    });
  });
});

describe("Add Products Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and add a product", async () => {
    const req = { body: { name: "Product 1" }, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Product 1", userId: 1 };
    prismaMock.product.findFirst.mockResolvedValue(null);
    prismaMock.product.create.mockResolvedValue(mockProduct);
    await addProducts(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: {
        name: req.body.name,
        user: { connect: { id: req.user.id } },
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "The product was added",
      product: mockProduct,
    });
  });

  it("should return 400 if product name is not provided", async () => {
    const req = { body: {}, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await addProducts(prismaMock)(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product name required",
    });
  });

  it("should return 400 if product already exists", async () => {
    const req = { body: { name: "Milk" }, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Milk", userId: 1 };
    prismaMock.product.findFirst.mockResolvedValue(mockProduct);
    await addProducts(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product is already added",
    });
  });

  it("should return 500 if there is an error", async () => {
    const req = { body: { name: "Milk" }, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findFirst.mockResolvedValue(null);
    prismaMock.product.create.mockRejectedValue(new Error("Error"));
    await addProducts(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: {
        name: req.body.name,
        user: { connect: { id: req.user.id } },
      },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "There was an error while adding the product",
    });
  });
});

describe("Delete Product Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and delete a product", async () => {
    const req = { body: { name: "Milk" }, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Milk", userId: 1 };
    prismaMock.product.findFirst.mockResolvedValue(mockProduct);
    prismaMock.product.delete.mockResolvedValue(mockProduct);
    await deleteProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { id: mockProduct.id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: `Product '${mockProduct.name}' was deleted successfully`,
    });
  });

  it("should return 400 if product is not found", async () => {
    const req = { body: { name: "Milk" }, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findFirst.mockResolvedValue(null);
    await deleteProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product is not in the product list",
    });
  });

  it("should return 500 if there is an error", async () => {
    const req = { body: { name: "Milk" }, user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Milk", userId: 1 };
    prismaMock.product.findFirst.mockResolvedValue(mockProduct);
    prismaMock.product.delete.mockRejectedValue(new Error("Error"));
    await deleteProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { id: mockProduct.id },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "There was an error while deleting the product",
    });
  });
});

describe("Delete All Products Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and delete all products", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProducts = [
      { id: 1, name: "Product 1", userId: 1 },
      { id: 2, name: "Product 2", userId: 1 },
    ];
    prismaMock.product.findMany.mockResolvedValue(mockProducts);
    prismaMock.product.deleteMany.mockResolvedValue(mockProducts);
    await deleteAllProducts(prismaMock)(req, res);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(prismaMock.product.deleteMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All products were deleted successfully",
      deleteProducts: mockProducts,
    });
  });

  it("should return 400 if product list is empty", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findMany.mockResolvedValue([]);
    await deleteAllProducts(prismaMock)(req, res);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product list is empty",
    });
  });

  it("should return 500 if there is an error", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findMany.mockResolvedValue([
      { id: 1, name: "Product 1", userId: 1 },
    ]);
    prismaMock.product.deleteMany.mockRejectedValue(new Error("Error"));
    await deleteAllProducts(prismaMock)(req, res);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(prismaMock.product.deleteMany).toHaveBeenCalledWith({
      where: { userId: req.user.id },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "There was an error while deleting all products",
    });
  });
});

describe("Update Product Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and update a product", async () => {
    const req = {
      body: { name: "Milk", newName: "Almond Milk" },
      user: { id: 1 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Milk", userId: 1 };
    prismaMock.product.findFirst
      .mockResolvedValueOnce(mockProduct)
      .mockResolvedValueOnce(null);
    prismaMock.product.update.mockResolvedValue({
      ...mockProduct,
      name: "Almond Milk",
    });
    await updateProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: mockProduct.id },
      data: { name: req.body.newName },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: `Product '${req.body.newName}' was updated successfully`,
    });
  });

  it("should return 400 if old product name is not provided", async () => {
    const req = {
      body: { newName: "Almond Milk" },
      user: { id: 1 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await updateProduct(prismaMock)(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product name required",
    });
  });

  it("should return 400 if new product name is not provided", async () => {
    const req = {
      body: { name: "Milk" },
      user: { id: 1 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await updateProduct(prismaMock)(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product name required",
    });
  });

  it("should return 400 if product is not found", async () => {
    const req = {
      body: { name: "Milk", newName: "Almond Milk" },
      user: { id: 1 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.product.findFirst.mockResolvedValue(null);
    await updateProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product not found",
    });
  });

  it("should return 400 if new product name already exists", async () => {
    const req = {
      body: { name: "Milk", newName: "Almond Milk" },
      user: { id: 1 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Milk", userId: 1 };
    prismaMock.product.findFirst
      .mockResolvedValueOnce(mockProduct)
      .mockResolvedValueOnce(mockProduct);
    await updateProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.newName,
        userId: req.user.id,
      },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product is already added",
    });
  });

  it("should return 500 if there is an error", async () => {
    const req = {
      body: { name: "Milk", newName: "Almond Milk" },
      user: { id: 1 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockProduct = { id: 1, name: "Milk", userId: 1 };
    prismaMock.product.findFirst
      .mockResolvedValueOnce(mockProduct)
      .mockResolvedValueOnce(null);
    prismaMock.product.update.mockRejectedValue(new Error("Error"));
    await updateProduct(prismaMock)(req, res);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: mockProduct.id },
      data: { name: req.body.newName },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "There was an error while updating the product",
    });
  });
});

describe("Delete User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and delete the user and their products successfully", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.product.deleteMany.mockResolvedValue({});
    prismaMock.user.delete.mockResolvedValue({});

    await deleteUser(prismaMock)(req, res);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaMock.product.deleteMany).toHaveBeenCalledWith({
      where: { userId: 1 },
    });

    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User and products deleted successfully",
    });
  });

  it("should return 400 if user is not found", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.user.findUnique.mockResolvedValue(null);

    await deleteUser(prismaMock)(req, res);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it("should return 500 on unexpected error", async () => {
    const req = { user: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    prismaMock.user.findUnique.mockRejectedValue(new Error("DB error"));

    await deleteUser(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "There was an error while deleting the user",
    });
  });
});
