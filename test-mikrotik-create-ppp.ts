import { loadEnvFile } from "process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    const username = "teste002";
    const password = "Teste@123456";
    const profile = "plano 30Mbps";

    try {
        console.log("====================================");
        console.log(" TESTE DE CRIAÇÃO PPPoE");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log(`\nCriando usuário PPPoE: ${username}`);
        console.log(`Perfil: ${profile}`);

        const id = await mikrotik.createPPPUser(
            username,
            password,
            profile
        );

        console.log("\n✅ Usuário PPPoE criado!");
        console.log("ID retornado:", id);

        const user = await mikrotik.findPPPUser(username);

        console.log("\nUsuário criado no RouterOS:");

        if (user) {
            console.log({
                id: user.id,
                username: user.username,
                service: user.service,
                profile: user.profile,
                disabled: user.disabled,
            });
        }

        console.log("\n✅ Teste concluído!");
    } catch (error) {
        console.error("\n❌ Erro ao criar usuário PPPoE:");

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