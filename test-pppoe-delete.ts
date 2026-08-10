import { loadEnvFile } from "node:process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

const USERNAME = "teste-sgp";

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("====================================");
        console.log(" TESTE REAL - REMOVER PPPoE");
        console.log("====================================");

        await mikrotik.connect();

        console.log("\n🔎 Procurando usuário PPPoE...");
        const user = await mikrotik.findPPPUser(USERNAME);

        if (!user) {
            console.log(`❌ Usuário "${USERNAME}" não encontrado.`);
            return;
        }

        console.log("✅ Usuário encontrado:");
        console.table([user]);

        console.log("\n🗑️ Removendo PPPoE...");
        console.log(`Usuário: ${USERNAME}`);

        await mikrotik.deletePPPUser(USERNAME);

        console.log("\n✅ Comando de remoção executado!");

        console.log("\n🔎 Confirmando remoção no RB750...");

        const deletedUser = await mikrotik.findPPPUser(USERNAME);

        if (deletedUser) {
            console.error(
                `❌ ERRO: o usuário "${USERNAME}" ainda existe no RB750.`,
            );

            console.table([deletedUser]);

            return;
        }

        console.log("\n🎉 REMOÇÃO CONFIRMADA COM SUCESSO NO RB750!");
        console.log(`Usuário removido: ${USERNAME}`);

        console.log("\n📋 Verificando os demais usuários PPPoE...");

        const users = await mikrotik.getPPPUsers();

        console.table(users);

        console.log(`\n✅ Total de PPPoE restantes: ${users.length}`);

        const teste = users.find(
            (user) => user.username === "teste",
        );

        const teste001 = users.find(
            (user) => user.username === "teste001",
        );

        console.log("\n🔐 Verificação de segurança:");

        console.log(
            `teste: ${teste ? "PRESERVADO ✅" : "NÃO ENCONTRADO ⚠️"}`,
        );

        console.log(
            `teste001: ${teste001 ? "PRESERVADO ✅" : "NÃO ENCONTRADO ⚠️"}`,
        );

        console.log("\n🎉 Teste de remoção PPPoE concluído!");
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

main().catch((error) => {
    console.error("\n❌ Erro fatal:", error);
});