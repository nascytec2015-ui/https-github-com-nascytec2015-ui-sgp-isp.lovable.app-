import { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DO MIKROTIK SERVICE");
        console.log("====================================");

        console.log("Conectando ao MikroTik...");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log("\nConsultando identidade do RouterOS...");

        const identity = await mikrotik.getIdentity();

        console.log("Identidade do MikroTik:");
        console.dir(identity, { depth: null });

        console.log("\n✅ Teste do MikroTikService concluído!");
    } catch (error) {
        console.error("\n❌ Erro no MikroTikService:");

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
