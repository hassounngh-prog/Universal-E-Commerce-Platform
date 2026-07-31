import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingCategories = await prisma.category.findMany();
  if (existingCategories.length > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const categories = [
    { name: "Figures", slug: "figures", description: "Anime figures and statues" },
    { name: "Apparel", slug: "apparel", description: "Clothing and accessories" },
    { name: "Posters", slug: "posters", description: "Wall scrolls and posters" },
    { name: "Plushies", slug: "plushies", description: "Plush toys and keychains" },
    { name: "Accessories", slug: "accessories", description: "Bags, wallets, and more" },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
