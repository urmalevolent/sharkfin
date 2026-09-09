import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CategoryType,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const expenseCategories = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Tagihan & Langganan",
  "Pendidikan",
  "Kesehatan",
  "Kebutuhan",
  "Lainnya",
];

const incomeCategories = [
  "Gaji",
  "Uang Saku",
  "Freelance",
  "Hadiah",
  "Investasi",
  "Lainnya",
];

async function main() {
  console.log("🌱 Memulai seed kategori SharkFin...");

  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: {
        id: `default-expense-${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
      },
      update: {},
      create: {
        id: `default-expense-${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
        name,
        type: CategoryType.EXPENSE,
        isDefault: true,
        userId: null,
      },
    });
  }

  for (const name of incomeCategories) {
    await prisma.category.upsert({
      where: {
        id: `default-income-${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
      },
      update: {},
      create: {
        id: `default-income-${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
        name,
        type: CategoryType.INCOME,
        isDefault: true,
        userId: null,
      },
    });
  }

  console.log("✅ Kategori default berhasil dibuat.");
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });