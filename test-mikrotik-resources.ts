import { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE RECURSOS DO MIKROTIK");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log("\nConsultando recursos do RouterOS...");

        const resources = await mikrotik.getSystemResources();

        console.log("\nRecursos do MikroTik:");
        console.dir(resources, { depth: null });

        console.log("\n✅ Consulta de recursos concluída!");
    } catch (error) {
        console.error("\n❌ Erro ao consultar recursos:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
    } finally {
        await mikrotik.disconnect();
    }
}

main();
