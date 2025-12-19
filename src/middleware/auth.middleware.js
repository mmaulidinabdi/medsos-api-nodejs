import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const AuthMiddleware = async (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // index 0 = Bearer, index 1 = tokennya
    const token = header.split("Bearer ")[1];
    // console.log(token);
    const decoded = jwt.verify(token, jwtSecret);

    const currentUser = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    // custom request dengan nama user(req.user)
    req.user = {
      id: currentUser.id,
      fullname: currentUser.fullname,
      username: currentUser.username,
      email: currentUser.email,
      image: currentUser.image,
      bio: currentUser.bio,
    };

    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};
