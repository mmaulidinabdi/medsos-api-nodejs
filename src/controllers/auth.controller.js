import * as z from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

export const RegisterUser = async (req, res) => {
  try {
    // validasi
    const userSchema = z.object({
      fullname: z.string().min(8, "Fullname minimal 8 karakter"),
      username: z.string().min(8, "Username minimal 8 karakter"),
      email: z.email("Gunakan Format Email contoh: example@gmail.com"),
      password: z.string().min(8, "Password minimal 8 karakter"),
    });
    const validate = userSchema.parse(req.body);

    // cek email dan username harus unique
    // Cek email dan username dengan findUnique atau findFirst
    const [emailExist, usernameExist] = await Promise.all([
      prisma.user.findUnique({
        where: { email: validate.email },
      }),
      prisma.user.findUnique({
        where: { username: validate.username },
      }),
    ]);

    if (emailExist) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar, silahkan gunakan email lain",
      });
    }

    if (usernameExist) {
      return res.status(409).json({
        success: false,
        message: "Username sudah digunakan, silahkan gunakan username lain",
      });
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(validate.password, salt);

    // simpan data ke database
    const newUser = await prisma.user.create({
      data: {
        fullname: validate.fullname,
        username: validate.username,
        password: hashedPassword,
        email: validate.email,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: newUser.id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image,
        bio: newUser.bio,
      },
    });
  } catch (err) {
    // error dari zod
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((e) => e.message);
      return res.status(400).json({
        success: false,
        errors: errors,
      });
    }

    // error lainnya
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong on server: ${err}`,
    });
  }
};

export const LoginUser = (req, res) => {
  res.json({
    msg: "Login User",
  });
};
