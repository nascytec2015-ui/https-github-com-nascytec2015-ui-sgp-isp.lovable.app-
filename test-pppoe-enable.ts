import { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    const username = "teste-sgp";

    try {
        console.log("====================================");
        console.log(" TESTE REAL - DESBLOQUEAR PPPoE");
        console.log("====================================");

        console.log("\n🔌 Conectando ao MikroTik...");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        console.log(`\n🔎 Procurando usuário "${username}"...`);

        const before = await mikrotik.findPPPUser(username);

        if (!before) {
            throw new Error(
                `O usuário PPP "${username}" não foi encontrado no MikroTik.`,
            );
        }

        console.log("✅ Usuário encontrado:");
        console.table([before]);

        if (!before.disabled) {
            console.log(
                `\n⚠️ O usuário "${username}" já está desbloqueado.`,
            );
        } else {
            console.log("\n🔓 Desbloqueando PPPoE...");
            console.log(`   Usuário: ${username}`);

            const updated = await mikrotik.enablePPPUser(username);

            console.log("\n✅ Comando de desbloqueio executado!");
            console.table([updated]);
        }

        console.log("\n🔎 Confirmando estado no RB750...");

        const confirmed = await mikrotik.findPPPUser(username);

        if (!confirmed) {
            throw new Error(
                `Não foi possível localizar "${username}" após o desbloqueio.`,
            );
        }

        console.table([confirmed]);

        if (confirmed.disabled) {
            throw new Error(
                `❌ O usuário "${username}" continua bloqueado no RB750.`,
            );
        }

        console.log(
            `\n🎉 DESBLOQUEIO CONFIRMADO COM SUCESSO NO RB750!`,
        );
        console.log(`Usuário: ${confirmed.username}`);
        console.log(`Perfil: ${confirmed.profile}`);
        console.log(`Disabled: ${confirmed.disabled}`);
    } catch (error) {
        console.error("\n❌ Erro no teste de desbloqueio:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }

    } finally {
        await mikrotik.disconnect();
    }
}

main().catch((error) => {
    console.error("\n❌ Erro inesperado:", error);
});