import { loadEnvFile } from "process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    const username = "teste002";

    try {
        console.log("====================================");
        console.log(" TESTE DE REMOÇÃO PPPoE");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log(`\nProcurando usuário "${username}"...`);

        const user = await mikrotik.findPPPUser(username);

        if (!user) {
            throw new Error(
                `Usuário "${username}" não existe no MikroTik.`
            );
        }

        console.log("Usuário encontrado:");
        console.log({
            id: user.id,
            username: user.username,
            service: user.service,
            profile: user.profile,
            disabled: user.disabled,
        });

        console.log(`\nRemovendo "${username}"...`);

        await mikrotik.deletePPPUser(username);

        console.log("✅ Usuário removido!");

        console.log("\nConfirmando remoção...");

        const deletedUser = await mikrotik.findPPPUser(username);

        if (deletedUser) {
            throw new Error(
                `Falha: "${username}" ainda existe no MikroTik.`
            );
        }

        console.log("✅ Remoção confirmada!");
        console.log(`Usuário "${username}" não existe mais.`);

        console.log("\n====================================");
        console.log(" TESTE DE REMOÇÃO CONCLUÍDO!");
        console.log("====================================");
    } catch (error) {
        console.error("\n❌ Erro no teste de remoção:");

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