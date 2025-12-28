import { prisma } from "../lib/prisma.js";

export const followUserAccount = async (req, res) => {
  // ambil data user sekarang
  const currentUserId = req.user.id;

  // data user yang di follow/unfollow
  const followUserId = Number(req.body.followUserId);

  // cek apakah curren user == follow user
  if (currentUserId === followUserId) {
    return res.status(400).json({
      success: false,
      message: "Anda tidak bisa follow diri sendiri",
    });
  }

  const otherUser = await prisma.user.findUnique({
    where: {
      id: followUserId,
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
        followerId: currentUserId,
        followingId: followUserId,
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
        followerId: currentUserId,
        followingId: followUserId,
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

export const unfollowUserAccount = async (req, res) => {
  // ambil data id yg ingin di unfollow
  const { unfollowUserId } = req.params;
  const unfollowId = Number(unfollowUserId);

  // data currentUser
  const currentUserId = req.user.id;

  if (unfollowId === currentUserId) {
    return res.status(400).json({
      success: false,
      message: "Tidak bisa unfollow diri sendiri",
    });
  }

  // cek apakah user yg ingin di unfoll ada
  const userUnfollow = await prisma.user.findUnique({
    where: {
      id: unfollowId,
    },
  });

  if (!userUnfollow) {
    return res.status(400).json({
      success: false,
      message: "User tidak ditemukan",
    });
  }

  //   cek apakah sudah follow
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: unfollowId,
      },
    },
  });

  if (!follow) {
    return res.status(400).json({
      success: false,
      message: "Belum follow user ini",
    });
  }

  try {
    // mencoba best practice pakai transaction

    await prisma.$transaction([
      // hapus data  di follow table
      prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: unfollowId,
          },
        },
      }),

      // update count user following dan follower
      prisma.user.update({
        where: {
          id: currentUserId,
        },
        data: {
          followingCount: {
            decrement: 1,
          },
        },
      }),

      prisma.user.update({
        where: {
          id: unfollowId,
        },
        data: {
          followerCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Unfollow user berhasil",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const getRecommendationUser = async (req, res) => {
  try {
    const currentUser = req.user.id;

    // ambil id user yg di follow oleh currentUser
    const followedUser = await prisma.follow.findMany({
      where: {
        followerId: currentUser,
      },
      select: {
        followingId: true,
      },
    });
    console.log(followedUser);

    const followedIds = followedUser.map((f) => f.followingId);
    console.log(followedIds);

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...followedIds, currentUser],
        },
      },
      select: {
        id: true,
        image: true,
        fullname: true,
        username: true,
      },
      take: 3,
      orderBy: {
        createAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Rekomendasi user yang bisa di follow",
      data: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const isFollowUser = async (req, res) => {
  try {
    const { followUserId } = req.params;
    const currentUser = req.user.id;

    const checkFollowUserId = await prisma.user.findUnique({
      where: {
        id: Number(followUserId),
      },
    });

    if (!checkFollowUserId) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const isFollowUserData = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser,
          followingId: checkFollowUserId.id,
        },
      },
    });

    if (isFollowUserData) {
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
      message: `Something went wrong on server: ${err}`,
    });
  }
};
