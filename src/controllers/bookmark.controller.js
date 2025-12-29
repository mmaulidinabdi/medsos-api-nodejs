import { prisma } from "../lib/prisma.js";

export const ToggleBookmark = async (req, res) => {
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
        message: "Feed tidak tersedia",
      });
    }

    const checkUserBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: currentUser,
          postId: post.id,
        },
      },
    });

    if (checkUserBookmark) {
      // delete bookmark
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: currentUser,
            postId: post.id,
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Feed berhasil dihapus dari bookmark",
      });
    }

    // masukkan feed ke bookmark
    const newBookmark = await prisma.bookmark.create({
      data: {
        userId: currentUser,
        postId: post.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil menambahkan feed ke bookmark",
      data: newBookmark,
    });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};
