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
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar belum diinput",
      });
    }

    const optimizedBuffer = await sharp(req.file.buffer)
      .rotate() // Memperbaiki rotasi otomatis berdasarkan metadata EXIF (PENTING!)
      .resize(1080, 1080, {
        fit: "cover",
        position: "entropy", // Mencari bagian terpenting gambar agar tidak terpotong sembarangan
      })
      .webp({
        quality: 80,
        effort: 6, // Tingkat usaha kompresi (1-6), 6 paling kecil sizenya tapi lambat prosesnya
      })
      .toBuffer();

    // generate nama file (AMAN)
    // const ext = req.file.mimetype === "image/png" ? "png" : "jpg";
    const fileName = `${randomUUID()}.webp`;

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
        imageId: fileName,
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
