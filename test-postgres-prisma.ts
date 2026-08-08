import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔌 Conectando ao PostgreSQL...");

    await prisma.$connect();

    console.log("✅ Prisma conectado ao PostgreSQL!");

    const result = await prisma.$queryRaw<
        { current_database: string; current_schema: string }[]
    >`
    SELECT current_database(), current_schema();
  `;

    console.log("📊 Banco:", result[0]);

    const tables = await prisma.$queryRaw<
        { tablename: string }[]
    >`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

    console.log("\n📋 Tabelas encontradas:");

    for (const table of tables) {
        console.log(`   • ${table.tablename}`);
    }
}

main()
    .catch((error) => {
        console.error("❌ Erro:", error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });