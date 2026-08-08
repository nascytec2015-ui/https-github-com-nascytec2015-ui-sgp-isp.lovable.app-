import { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE SESSÕES PPP ATIVAS");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log("\nConsultando sessões PPP ativas...");

        const sessions = await mikrotik.getActivePPPSessions();

        console.log("\nSessões PPP ativas:");
        console.dir(sessions, { depth: null });

        console.log("\n✅ Consulta de sessões PPP concluída!");
    } catch (error) {
        console.error("\n❌ Erro ao consultar sessões PPP:");

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