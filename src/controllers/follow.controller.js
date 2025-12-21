import { prisma } from "../lib/prisma.js";

export const followUserAccount = async (req, res) => {
  // ambil data user sekarang
  const currentUserId = req.user.id;

  // data user yang di follow/unfollow
  const { followUserId } = req.body;

  // cek apakah curren user == follow user
  if (currentUserId === followUserId) {
    return res.status(400).json({
      success: false,
      message: "Anda tidak bisa follow/unfollow diri sendiri",
    });
  }

  const otherUser = await prisma.user.findUnique({
    where: {
      id: Number(followUserId),
    },
  });

  if (!otherUser) {
    return res.status(404).json({
      success: false,
      message: "User tidak ditemukan",
    });
  }

  const isFollowUser = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followingId: Number(currentUserId),
        followerId: Number(followUserId),
      },
    },
  });

  if (isFollowUser) {
    return res.status(400).json({
      success: false,
      message: "User sudah di follow",
    });
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId: Number(followUserId),
        followingId: Number(currentUserId),
      },
    });

    // update user count
    await prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        followingCount: {
          increment: 1,
        },
      },
    });

    await prisma.user.update({
      where: {
        id: followUserId,
      },
      data: {
        followerCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Follow user berhasil",
      data: follow,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};
