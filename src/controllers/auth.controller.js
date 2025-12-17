import * as z from "zod";
import { prisma } from '../lib/prisma.js';

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
    // const emailExist = await prisma.user.findUnique({
    //   where:{
    //     email: validate.email
    //   }
    // })

    // hash password

    // simpan data ke database
  } catch (err) {}
};

export const LoginUser = (req, res) => {
  res.json({
    msg: "Login User",
  });
};
