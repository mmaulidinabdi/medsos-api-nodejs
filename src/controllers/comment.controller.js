import { prisma } from "../lib/prisma.js";

export const createComment = async (req, res) => {
  try {
    const currentUser = Number(req.user.id);

    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: "post atau content wajib diisi",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post tidak ditemukan" });
    }

    const newComment = await prisma.comment.create({
      data: {
        userId: currentUser,
        postId: Number(post.id),
        content: content,
      },
    });

    await prisma.post.update({
      where: {
        id: Number(postId),
      },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Comment berhasil dibuat",
      data: newComment,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const deleteCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment tidak ditemukan",
      });
    }


    if (comment.userId !== Number(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: "Anda tidak bisa menghapus komentar user lain",
      });
    }

    await prisma.comment.delete({
      where: {
        id: Number(id),
      },
    });

    await prisma.post.update({
      where: {
        id: comment.postId,
      },
      data: {
        commentCount: { decrement: 1 },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment berhasil dihapus",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};
