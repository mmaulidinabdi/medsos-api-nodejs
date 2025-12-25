import { prisma } from "../lib/prisma.js";
import * as z from "zod";
import supabase from "../lib/supabase.js";
import { randomUUID } from "crypto";
import sharp from "sharp";


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
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // validasi data yg diterima dari req.body
    const dataToUpdate = z.object({
      fullname: z.string().min(8, "Fullname minimal 8 karakter"),
      username: z.string().min(8, "Username minimal 8 karakter"),
      bio: z.string(),
    });

    const validate = dataToUpdate.parse(req.body);

    console.log("isi data yg sudah tervalidasi ", validate);

    // cek data username harus unique
    const uniqueUsername = await prisma.user.findUnique({
      where: {
        username: validate.username,
      },
    });

    console.log("isi unique username", uniqueUsername);

    if (uniqueUsername && uniqueUsername.id !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Username tidak bisa digunakan",
      });
    }

    // update data ke db
    const newData = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        fullname: validate.fullname,
        username: validate.username,
        bio: validate.bio,
      },
      omit: {
        password: true,
      },
    });
    console.log("isi new data", newData);

    // response
    return res.status(201).json({
      success: true,
      message: "Update user berhasil",
      data: newData,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((e) => e.message);
      return res.status(400).json({
        success: false,
        errors: errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    // 1. Validasi file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File belum di upload",
      });
    }

    // 2. Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // 3. Proses Gambar dengan SHARP (Lakukan sebelum upload)
    // Kita ubah ke .webp karena sizenya jauh lebih kecil tapi kualitas tajam
    const optimizedBuffer = await sharp(req.file.buffer)
      .rotate() // Memperbaiki rotasi otomatis dari metadata HP
      .resize(400, 400, {
        // Ukuran standar avatar 400x400
        fit: "cover", // Memastikan gambar memenuhi area 1:1 (crop otomatis)
        position: "center", // Bisa pakai 'entropy' untuk fokus ke objek utama
      })
      .webp({ quality: 80 }) // Kompresi ke webp kualitas 80%
      .toBuffer();

    const fileName = `${randomUUID()}.webp`;

    // 4. Hapus gambar lama jika ada
    if (currentUser.imageId) {
      await supabase.storage.from("avatar").remove([currentUser.imageId]);
    }

    // 5. Upload buffer hasil Sharp ke Supabase
    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(fileName, optimizedBuffer, {
        contentType: "image/webp", // Konsisten dengan output Sharp
        upsert: true,
      });

    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message,
      });
    }

    // 6. Ambil public url
    const { data } = supabase.storage.from("avatar").getPublicUrl(fileName);

    // 7. Update DB
    const newData = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        image: data.publicUrl,
        imageId: fileName,
      },
      omit: {
        password: true,
      },
    });

    // 8. Response
    return res.json({
      success: true,
      message: "Avatar berhasil diupdate",
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
