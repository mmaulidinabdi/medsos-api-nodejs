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
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_postId: {
              userId: currentUser,
              postId: post.id,
            },
          },
        }),

        prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            likeCount: { decrement: 1 },
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Unlike post berhasil",
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

export const CheckLikeUser = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUser = req.user.id;

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

    const checkLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: currentUser,
          postId: post.id,
        },
      },
    });

    if (checkLike) {
      return res.status(200).json({
        success: true,
        data: true,
      });
    }

    return res.status(200).json({
      success: true,
      data: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};
