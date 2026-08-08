import { loadEnvFile } from "process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE PPP SECRETS");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log("\nConsultando usuários PPP cadastrados...");

        const secrets = await mikrotik.getPPPSecrets();

        console.log("\nPPP Secrets:");
        console.dir(secrets, { depth: null });

        console.log("\n✅ Consulta de PPP Secrets concluída!");
    } catch (error) {
        console.error("\n❌ Erro ao consultar PPP Secrets:");

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