import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🔌 Conectando ao PostgreSQL...");

    await prisma.$connect();

    console.log("✅ Prisma conectado ao PostgreSQL!");

    // Teste de conexão
    const database = await prisma.$queryRaw<
        {
            current_database: string;
            current_schema: string;
        }[]
    >`
    SELECT current_database(), current_schema();
  `;

    console.log("📊 Banco:", database[0]);

    // ==========================================
    // TESTE REAL VIA PRISMA
    // ==========================================

    const clientes = await prisma.clientes.findMany({
        take: 5,
    });

    console.log(`\n👥 Clientes encontrados: ${clientes.length}`);

    clientes.forEach((cliente, index) => {
        console.log(`\n--- Cliente ${index + 1} ---`);
        console.log(cliente);
    });

    const planos = await prisma.planos.findMany({
        take: 5,
    });

    console.log(`\n📦 Planos encontrados: ${planos.length}`);

    planos.forEach((plano, index) => {
        console.log(`\n--- Plano ${index + 1} ---`);
        console.log(plano);
    });
}

main()
    .catch((error) => {
        console.error("❌ Erro:", error);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });