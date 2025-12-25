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
    const posts = await prisma.post.findMany({
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
    });

    return res.status(200).json({
      success: true,
      message: "Get All Post",
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
