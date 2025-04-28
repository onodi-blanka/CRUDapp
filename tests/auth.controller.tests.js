import { login, register } from "../controllers/auth.controllers.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
jest.mock("@prisma/client");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("LogIn Controller", () => {
  it("should return successfully and return a token", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "test1234",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 1,
      email: "test@gmail.com",
      password: "hashedPassword",
    });
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue("fakeToken");
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      token: "fakeToken",
    });
  });

  it("should return 400 if user not found", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "hashedPassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should throw an error if password do not match", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "wrongPassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 1,
      email: "test@gmail.com",
      password: "hashedPassword",
    });
    bcrypt.compare = jest.fn().mockResolvedValue(false);
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });
  it("should return 500 if there is an internal server error", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "test1234",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    prisma.user.findUnique = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("Register Controller", () => {
  it("should return successfully and create a user", async () => {
    const req = {
      body: {
        email: "teest@gmail.com",
        password: "test1234",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
    prisma.user.create = jest.fn().mockResolvedValue({
      id: 1,
      email: "teest@gmail.com",
      password: "hashedPassword",
    });
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
      user: {
        id: 1,
        email: "teest@gmail.com",
        password: "hashedPassword",
      },
    });
  });

  it("should return 400 if user already exists", async () => {
    const req = {
      body: {
        email: "teest@gmail.com",
        password: "test1234",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 1,
      email: "teest@gmail.com",
      password: "hashedPassword",
    });
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already exists",
    });
  });

  it("should return 500 if there is an internal server error", async () => {
    const req = {
      body: {
        email: "teest@gmail.com",
        password: "test1234",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma.user.findUnique = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Something went wrong",
    });
  });
});
