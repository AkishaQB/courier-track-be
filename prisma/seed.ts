import { PrismaClient } from "../src/generated/prisma/client";
import type { Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const regions = [
  { regionCode: "NORTH", regionName: "Northern Region" },
  { regionCode: "SOUTH", regionName: "Southern Region" },
  { regionCode: "EAST", regionName: "Eastern Region" },
  { regionCode: "WEST", regionName: "Western Region" },
  { regionCode: "CENTRAL", regionName: "Central Region" },
];

async function main() {
  console.log("🌱 Seeding regions...");

  for (const region of regions) {
    const result = await prisma.region.upsert({
      where: { regionCode: region.regionCode } as Prisma.RegionWhereUniqueInput,
      update: {},
      create: region,
    });
    console.log(
      `  ✅ ${result.regionCode} — ${result.regionName} (${result.id})`,
    );
  }

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
