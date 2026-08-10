import process, { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE PPP SECRETS");
        console.log("====================================");

        await mikrotik.connect();

        console.log("OK - Servico MikroTik conectado!");
        console.log("\nConsultando usuarios PPP cadastrados...");

        const users = await mikrotik.getPPPUsers();

        console.log("\nPPP Secrets:");
        console.table(users);

        console.log(`\nOK - Total de PPPoE: ${users.length}`);
        console.log("OK - Consulta de PPP Secrets concluida!");
    } catch (error) {
        console.error("\nERRO ao consultar PPP Secrets:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }

        process.exitCode = 1;
    } finally {
        await mikrotik.disconnect();
    }
}

main().catch((error) => {
    console.error("Erro inesperado:", error);
    process.exitCode = 1;
});
