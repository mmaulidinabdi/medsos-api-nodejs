import { prisma } from "../lib/prisma.js";

export const LikeFeedUser = async (req, res) => {
  try {
    const currentUser = req.user.id;
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Feed tidak ditemukan",
      });
    }

    // cek jika user sudah like feed tersebut
    const checkLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: currentUser,
          postId: Number(postId),
        },
      },
    });

    if (checkLike) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah like postingan ini sebelumnya",
      });
    }

    // insert data like
    const newLike = await prisma.like.create({
      data: {
        userId: currentUser,
        postId: Number(postId),
      },
    });

    // update like count di post
    await prisma.post.update({
      where: {
        id: Number(postId),
      },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Berhasil like feed",
      data: newLike,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};
