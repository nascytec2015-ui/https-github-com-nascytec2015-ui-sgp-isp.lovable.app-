import "dotenv/config";

import { MikroTikService } from "./src/services/mikrotik";

const USERNAME = "teste-sgp";

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("🔌 Conectando ao MikroTik...");

        await mikrotik.connect();

        console.log("✅ Conectado!");

        console.log("");
        console.log("🔎 Procurando usuário PPPoE...");

        const currentUser = await mikrotik.findPPPUser(USERNAME);

        if (!currentUser) {
            throw new Error(
                `O usuário "${USERNAME}" não foi encontrado no MikroTik.`,
            );
        }

        console.log("✅ Usuário encontrado:");

        console.table([currentUser]);

        console.log("");
        console.log("🔒 Bloqueando PPPoE...");
        console.log(`   Usuário: ${USERNAME}`);

        const blockedUser = await mikrotik.disablePPPUser(USERNAME);

        console.log("");
        console.log("✅ Comando de bloqueio executado!");

        console.table([
            {
                id: blockedUser.id,
                username: blockedUser.username,
                service: blockedUser.service,
                profile: blockedUser.profile,
                disabled: blockedUser.disabled,
            },
        ]);

        console.log("");
        console.log("🔎 Confirmando bloqueio no RB750...");

        const confirmedUser = await mikrotik.findPPPUser(USERNAME);

        if (!confirmedUser) {
            throw new Error(
                `O usuário "${USERNAME}" não foi encontrado após o bloqueio.`,
            );
        }

        console.table([
            {
                id: confirmedUser.id,
                username: confirmedUser.username,
                service: confirmedUser.service,
                profile: confirmedUser.profile,
                disabled: confirmedUser.disabled,
            },
        ]);

        if (!confirmedUser.disabled) {
            throw new Error(
                `Bloqueio não confirmado. O usuário "${USERNAME}" continua habilitado.`,
            );
        }

        console.log("");
        console.log("🎉 Bloqueio PPPoE confirmado com sucesso no RB750!");
    } catch (error) {
        console.error("");
        console.error("❌ Erro no teste de bloqueio PPPoE:");

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