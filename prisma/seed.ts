import { PrismaClient } from "../src/generated/prisma/client";
import type { Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
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

  // ─── Seed default staff user ─────────────────────────────
  console.log("🌱 Seeding default user...");

  const hashedPassword = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "admin123",
    10,
  );
  const user = await prisma.user.upsert({
    where: { email: "admin@couriertrack.com" } as Prisma.UserWhereUniqueInput,
    update: {},
    create: {
      email: "admin@couriertrack.com",
      password: hashedPassword,
      name: "Admin Staff",
      role: "staff",
    },
  });
  console.log(`  ✅ ${user.email} — ${user.name} (${user.id})`);

  // ─── Seed default logistics user ─────────────────────────
  console.log("🌱 Seeding default logistics user...");

  const hashedLogisticsPassword = await bcrypt.hash(
    process.env.SEED_LOGISTICS_PASSWORD ?? "logistics123",
    10,
  );
  const logisticsUser = await prisma.user.upsert({
    where: { email: "logistics@couriertrack.com" } as Prisma.UserWhereUniqueInput,
    update: {},
    create: {
      email: "logistics@couriertrack.com",
      password: hashedLogisticsPassword,
      name: "Logistics Operator",
      role: "logistics",
    },
  });
  console.log(`  ✅ ${logisticsUser.email} — ${logisticsUser.name} (${logisticsUser.id})`);

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
