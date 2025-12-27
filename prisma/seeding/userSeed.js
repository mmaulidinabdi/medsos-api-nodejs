import {prisma} from "../../src/lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
        
      {
        fullname: "Ihsan Hanafi",
        email: "ihsan23@gmail.com",
        username: "ihsan2423",
        password,
      },
      {
        fullname: "Ahmad blblbb",
        email: "ahmad@gmail.com",
        username: "ahmad123",
        password,
      },
      {
        fullname: "John Doe",
        email: "john@gmail.com",
        username: "johndoe",
        password,
      },
      {
        fullname: "Kira",
        email: "Kira@gmail.com",
        username: "kira",
        password,
      },
      {
        fullname: "Dio",
        email: "Dio@gmail.com",
        username: "Dio Brando",
        password,
      },
      {
        fullname: "Toruu",
        email: "toruu@gmail.com",
        username: "Toruu",
        password,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
