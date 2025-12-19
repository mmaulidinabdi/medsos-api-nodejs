import { prisma } from "../lib/prisma.js";

export const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      omit: {
        password: true,
        imageId: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Username tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      message: "Detail user",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const searchUser = async (req, res) => {
  const { username } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
        select: {
          id: true,
          username: true,
          fullname: true,
          image: true,
        },
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "username tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hasil pencarian username berhasil",
      data: users
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};
