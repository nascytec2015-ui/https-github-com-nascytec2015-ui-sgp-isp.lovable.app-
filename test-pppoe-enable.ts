import process from "node:process";
import { loadEnvFile } from "node:process";

import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

const USERNAME = "teste-sgp";

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE DE DESBLOQUEIO PPPoE");
        console.log("====================================");

        console.log("\n🔌 Conectando ao MikroTik...");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log(`\n🔎 Procurando usuário PPPoE "${USERNAME}"...`);

        const userBefore = await mikrotik.findPPPUser(USERNAME);

        if (!userBefore) {
            throw new Error(
                `Usuário PPPoE "${USERNAME}" não foi encontrado no MikroTik.`,
            );
        }

        console.log("✅ Usuário encontrado:");
        console.table([userBefore]);

        if (!userBefore.disabled) {
            console.log(
                `\n⚠️ O usuário "${USERNAME}" já está desbloqueado.`,
            );

            return;
        }

        console.log("\n🔓 Desbloqueando PPPoE...");
        console.log(`   Usuário: ${USERNAME}`);

        const updatedUser = await mikrotik.enablePPPUser(USERNAME);

        console.log("\n✅ Comando de desbloqueio executado!");
        console.table([updatedUser]);

        console.log("\n🔎 Confirmando desbloqueio no RB750...");

        const userAfter = await mikrotik.findPPPUser(USERNAME);

        if (!userAfter) {
            throw new Error(
                `Não foi possível encontrar "${USERNAME}" após o desbloqueio.`,
            );
        }

        console.table([userAfter]);

        if (userAfter.disabled) {
            throw new Error(
                `O usuário "${USERNAME}" continua bloqueado no RB750.`,
            );
        }

        console.log(
            `\n🎉 DESBLOQUEIO CONFIRMADO COM SUCESSO NO RB750!`,
        );
        console.log(`   Usuário: ${userAfter.username}`);
        console.log(`   Perfil: ${userAfter.profile}`);
        console.log(`   Disabled: ${userAfter.disabled}`);
    } catch (error) {
        console.error("\n❌ Erro no teste de desbloqueio:");

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
    console.error("\n❌ Erro inesperado:", error);
    process.exitCode = 1;
});