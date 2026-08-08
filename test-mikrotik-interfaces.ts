import { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE INTERFACES DO MIKROTIK");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log("\nConsultando interfaces do RouterOS...");

        const interfaces = await mikrotik.getInterfaces();

        console.log("\nInterfaces do MikroTik:");
        console.dir(interfaces, { depth: null });

        console.log("\n✅ Consulta de interfaces concluída!");
    } catch (error) {
        console.error("\n❌ Erro ao consultar interfaces:");

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