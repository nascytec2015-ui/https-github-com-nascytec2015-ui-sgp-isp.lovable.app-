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

    console.log("✅ Conectado!\n");

    console.log("📊 Quantidade de registros:");
    console.log("--------------------------------");

    console.log("clientes:       ", await prisma.clientes.count());
    console.log("planos:         ", await prisma.planos.count());
    console.log("profiles:       ", await prisma.profiles.count());
    console.log("users:          ", await prisma.users.count());
    console.log("projetos_ftth:  ", await prisma.projetos_ftth.count());
    console.log("ordens_servico: ", await prisma.ordens_servico.count());

    console.log("\n🔄 Tabelas de sincronização:");
    console.log("--------------------------------");

    console.log("sync_logs:      ", await prisma.sync_logs.count());
    console.log("sync_versions:  ", await prisma.sync_versions.count());
    console.log("sync_conflicts: ", await prisma.sync_conflicts.count());
}

main()
    .catch((error) => {
        console.error("\n❌ Erro:", error);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });