import { loadEnvFile } from "process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE USUÁRIOS PPP DO SGP");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log("\nConsultando usuários PPP...");

        const users = await mikrotik.getPPPUsers();

        console.log("\nUsuários PPP encontrados:");

        for (const user of users) {
            console.log({
                id: user.id,
                username: user.username,
                service: user.service,
                profile: user.profile,
                disabled: user.disabled,
            });
        }

        console.log(`\nTotal de usuários: ${users.length}`);

        console.log("\nProcurando usuário 'teste'...");

        const user = await mikrotik.findPPPUser("teste");

        if (user) {
            console.log("✅ Usuário encontrado:");
            console.log(user);
        } else {
            console.log("⚠️ Usuário não encontrado.");
        }

        console.log("\n✅ Teste de usuários PPP concluído!");
    } catch (error) {
        console.error("\n❌ Erro no teste:");

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