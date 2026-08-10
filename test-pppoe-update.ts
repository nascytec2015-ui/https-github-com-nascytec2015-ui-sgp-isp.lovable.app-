import "dotenv/config";

import { MikroTikService } from "./src/services/mikrotik";

const USERNAME = "teste-sgp";
const NEW_PASSWORD = "87654321";
const NEW_PROFILE = "plano 80Mbps";

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
        console.log("✏️ Alterando PPPoE...");
        console.log(`   Usuário: ${USERNAME}`);
        console.log(`   Novo perfil: ${NEW_PROFILE}`);
        console.log("   Nova senha: ********");

        const updatedUser = await mikrotik.updatePPPUser(
            USERNAME,
            {
                password: NEW_PASSWORD,
                profile: NEW_PROFILE,
            },
        );

        console.log("");
        console.log("✅ PPPoE atualizado com sucesso!");

        console.table([
            {
                id: updatedUser.id,
                username: updatedUser.username,
                service: updatedUser.service,
                profile: updatedUser.profile,
                disabled: updatedUser.disabled,
            },
        ]);

        console.log("");
        console.log("🔎 Confirmando alteração no RB750...");

        const confirmedUser = await mikrotik.findPPPUser(USERNAME);

        if (!confirmedUser) {
            throw new Error(
                `O usuário "${USERNAME}" não foi encontrado após a alteração.`,
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

        if (confirmedUser.profile !== NEW_PROFILE) {
            throw new Error(
                `Perfil não confirmado. Esperado "${NEW_PROFILE}", encontrado "${confirmedUser.profile}".`,
            );
        }

        console.log("");
        console.log("🎉 Teste de edição PPPoE concluído com sucesso!");
    } catch (error) {
        console.error("");
        console.error("❌ Erro no teste de edição PPPoE:");

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