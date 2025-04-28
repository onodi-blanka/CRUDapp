import { register, login } from "../controllers/auth.controllers.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    })),
  };
});

const prismaMock = new PrismaClient();

describe("Login Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and return a token", async () => {
    const req = { body: { email: "test@gmail.com", password: "test1234" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@gmail.com",
      password: "hashedPassword",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fakeToken");

    await login(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      token: "fakeToken",
    });
  });

  it("should return 400 if user not found", async () => {
    const req = { body: { email: "test@gmail.com", password: "test1234" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockResolvedValue(null);

    await login(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should throw an error if password does not match", async () => {
    const req = {
      body: { email: "test@gmail.com", password: "wrongPassword" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@gmail.com",
      password: "hashedPassword",
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("should return 500 if there is an internal server error", async () => {
    const req = { body: { email: "test@gmail.com", password: "test1234" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockRejectedValue(new Error("DB error"));

    await login(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("Register Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return successfully and create a user", async () => {
    const req = { body: { email: "test2@gmail.com", password: "test1234" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");

    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: "test2@gmail.com",
      password: "hashedPassword",
    });

    await register(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
      user: {
        id: 1,
        email: "test2@gmail.com",
        password: "hashedPassword",
      },
    });
  });

  it("should return 400 if user already exists", async () => {
    const req = { body: { email: "test2@gmail.com", password: "test1234" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test2@gmail.com",
    });

    await register(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
  });

  it("should return 500 if there is an internal server error", async () => {
    const req = { body: { email: "test2@gmail.com", password: "test1234" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prismaMock.user.findUnique.mockRejectedValue(new Error("DB error"));

    await register(prismaMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});
