"use strict";
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  const keys = [
    { key: `msa_free_${crypto.randomBytes(8).toString("hex")}`, plan: "free" },
    { key: `msa_pro_${crypto.randomBytes(8).toString("hex")}`, plan: "pro" }
  ];

  for (const data of keys) {
    const record = await prisma.apiKey.upsert({
      where: { key: data.key },
      update: {},
      create: data
    });
    console.log(`[seed] ${record.plan.padEnd(4)} key: ${record.key}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
