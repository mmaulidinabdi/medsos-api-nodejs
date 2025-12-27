import sharp from "sharp";
import { prisma } from "../lib/prisma.js";
import { randomUUID } from "crypto";
import supabase from "../lib/supabase.js";

export const CreateFeed = async (req, res) => {
  try {
    const { caption } = req.body;
    const currentUser = req.user.id;

    // validation
    if (!caption) {
      return res.status(400).json({
        success: false,
        message: "Caption harus diisi",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar belum diinput",
      });
    }

    const optimizedBuffer = await sharp(req.file.buffer)
      .rotate() // Memperbaiki rotasi otomatis berdasarkan metadata EXIF (PENTING!)
      .resize({
        width: 1080, // Kunci lebar di 1080px sesuai standar IG
        height: 1350, // Beri batas tinggi maksimal (Portrait IG)
        fit: "inside", // JANGAN potong gambarnya
        withoutEnlargement: true, // JANGAN paksa gambar kecil jadi besar
      })
      .webp({
        quality: 80,
        effort: 6, // Tingkat usaha kompresi (1-6), 6 paling kecil sizenya tapi lambat prosesnya
      })
      .toBuffer();

    // generate nama file (AMAN)
    // const ext = req.file.mimetype === "image/png" ? "png" : "jpg";
    const rawId = randomUUID();
    const fileName = `${rawId}.webp`;

    //upload ke Supabase
    const { error: uploadError } = await supabase.storage
      .from("feed")
      .upload(fileName, optimizedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message,
      });
    }

    //  Ambil public url
    const { data } = supabase.storage.from("feed").getPublicUrl(fileName);

    // create data post di table post
    const newData = await prisma.post.create({
      data: {
        caption,
        image: data.publicUrl,
        imageId: rawId,
        userId: currentUser,
      },
    });

    // update data user di table user
    await prisma.user.update({
      where: {
        id: currentUser,
      },
      data: {
        postCount: { increment: 1 },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Feeds berhasil dibuat",
      data: newData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const ReadAllFeeds = async (req, res) => {
  try {
    const currentUser = req.user.id;
    const followings = await prisma.follow.findMany({
      where: {
        followerId: currentUser,
      },
      select: {
        followingId: true,
      },
    });

    // Query Request
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const followingIds = followings.map((i) => i.followingId);


    const totalFeed = await prisma.post.count({
      where: {
        userId: { in: [...followingIds, currentUser] },
      },
    });


    const posts = await prisma.post.findMany({
      where: {
        userId: { in: [...followingIds, currentUser] },
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createAt: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalFeed / limit);

    return res.status(200).json({
      success: true,
      message: "Get All Post",
      page,
      limit,
      totalPages,
      totalFeed,
      data: posts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const detailFeeds = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            username: true,
            image: true,
          },
        },
        comments: {
          select: {
            content: true,
            createAt: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: { createAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get detail Feed",
      data: post,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

export const deleteFeed = async (req, res) => {
  const { id } = req.params;

  try {
    const postData = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!postData) {
      return res.status(404).json({
        success: false,
        message: "Feed tidak ditemukan",
      });
    }

    if (postData.userId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Anda tidak berhak menghapus feed ini",
      });
    }

    // 3. Hapus gambar di Supabase Storage (dilakukan di luar transaksi DB)
    if (postData.imageId) {
      const { error: storageError } = await supabase.storage
        .from("feed")
        .remove([`${postData.imageId}.webp`]); // Supabase .remove butuh array []

      if (storageError) {
        return res.status(500).json({
          success: false,
          message: "Gagal menghapus file gambar, proses pembatalan...",
        });
      }
    }

    // 4. Jalankan Database Transaction
    await prisma.$transaction([
      prisma.post.delete({
        where: { id: postData.id },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { postCount: { decrement: 1 } },
      }),
    ]);

    // response
    return res.status(200).json({
      success: true,
      message: "Feed berhasil dihapus",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};
