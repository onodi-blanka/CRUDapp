import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { id: decoded.userID };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid token. Please log in again." });
  }
};

export default authenticate;
