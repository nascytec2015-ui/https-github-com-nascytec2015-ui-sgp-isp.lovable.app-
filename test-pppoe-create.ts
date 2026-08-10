import "dotenv/config";

import { MikroTikService } from "./src/services/mikrotik";

const USERNAME = "teste-sgp";
const PASSWORD = "12345678";
const PROFILE = "plano 30Mbps";

async function main() {
    const mikrotik = new MikroTikService();

try {
    console.log("🔌 Conectando ao MikroTik...");

    await mikrotik.connect();

    console.log("✅ Conectado!");

    console.log("");
    console.log("📡 Verificando se o usuário já existe...");

    const existingUser = await mikrotik.findPPPUser(USERNAME);

    if (existingUser) {
        console.log("");
        console.log(
            `⚠️ O usuário "${USERNAME}" já existe no MikroTik.`,
        );

        console.table([existingUser]);

        return;
    }

    console.log("");
    console.log("📡 Criando usuário PPPoE...");
    console.log(`   Usuário: ${ USERNAME } `);
    console.log(`   Perfil:  ${ PROFILE } `);

    const createdUser = await mikrotik.createPPPUser(
        USERNAME,
        PASSWORD,
        PROFILE,
    );

    console.log("");
    console.log("✅ PPPoE criado com sucesso!");

    console.table([
        {
            id: createdUser.id,
            username: createdUser.username,
            service: createdUser.service,
            profile: createdUser.profile,
            disabled: createdUser.disabled,
        },
    ]);

    console.log("");
    console.log("🔎 Confirmando usuário no MikroTik...");

    const confirmedUser = await mikrotik.findPPPUser(USERNAME);

    if (!confirmedUser) {
        throw new Error(
            `O usuário "${USERNAME}" não foi encontrado após a criação.`,
        );
    }

    console.log("✅ Usuário confirmado no RB750!");

    console.table([
        {
            id: confirmedUser.id,
            username: confirmedUser.username,
            service: confirmedUser.service,
            profile: confirmedUser.profile,
            disabled: confirmedUser.disabled,
        },
    ]);

    console.log("");
    console.log("🎉 Teste de criação PPPoE concluído com sucesso!");
} catch (error) {
    console.error("");
    console.error("❌ Erro no teste de criação PPPoE:");

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