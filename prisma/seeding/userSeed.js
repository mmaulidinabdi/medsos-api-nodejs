import {prisma} from "../../src/lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
        
      {
        fullname: "Ihsan Hanafi",
        email: "ihsan23@mail.com",
        username: "ihsan2423",
        password,
      },
      {
        fullname: "Ahmad blblbb",
        email: "ahmad@mail.com",
        username: "ahmad123",
        password,
      },
      {
        fullname: "John Doe",
        email: "john@mail.com",
        username: "johndoe",
        password,
      },
      {
        fullname: "Kira",
        email: "Kira@mail.com",
        username: "kira",
        password,
      },
      {
        fullname: "Dio",
        email: "Dio@mail.com",
        username: "Dio Brando",
        password,
      },
      {
        fullname: "Toruu",
        email: "toruu@mail.com",
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
