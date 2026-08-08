import { loadEnvFile } from "process";
import { MikroTikService } from "./src/services/mikrotik";

loadEnvFile(".env");

async function main() {
    const mikrotik = new MikroTikService();

    const username = "teste002";

    try {
        console.log("====================================");
        console.log(" TESTE DE GERENCIAMENTO PPPoE");
        console.log("====================================");

        await mikrotik.connect();

        console.log("✅ Serviço MikroTik conectado!");

        // 1. Consultar
        console.log(`\n1. Consultando ${username}...`);

        let user = await mikrotik.findPPPUser(username);

        if (!user) {
            throw new Error(
                `Usuário "${username}" não encontrado.`
            );
        }

        console.log(user);

        // 2. Alterar perfil
        console.log("\n2. Alterando perfil...");

        user = await mikrotik.updatePPPUser(username, {
            profile: "plano 80Mbps",
        });

        console.log("✅ Perfil alterado:");
        console.log(user);

        // 3. Alterar senha
        console.log("\n3. Alterando senha...");

        user = await mikrotik.updatePPPUser(username, {
            password: "Teste@987654",
        });

        console.log("✅ Senha alterada com sucesso.");

        // 4. Bloquear
        console.log("\n4. Bloqueando usuário...");

        user = await mikrotik.disablePPPUser(username);

        console.log("✅ Usuário bloqueado:");
        console.log(user);

        // 5. Confirmar bloqueio
        console.log("\n5. Confirmando bloqueio...");

        user = await mikrotik.findPPPUser(username);

        console.log(user);

        if (!user?.disabled) {
            throw new Error(
                "Falha: usuário não está bloqueado."
            );
        }

        console.log("✅ Bloqueio confirmado!");

        // 6. Desbloquear
        console.log("\n6. Desbloqueando usuário...");

        user = await mikrotik.enablePPPUser(username);

        console.log("✅ Usuário desbloqueado:");
        console.log(user);

        // 7. Confirmar desbloqueio
        console.log("\n7. Confirmando desbloqueio...");

        user = await mikrotik.findPPPUser(username);

        console.log(user);

        if (user?.disabled) {
            throw new Error(
                "Falha: usuário continua bloqueado."
            );
        }

        console.log("✅ Desbloqueio confirmado!");

        console.log("\n====================================");
        console.log(" TESTE CONCLUÍDO COM SUCESSO!");
        console.log("====================================");
    } catch (error) {
        console.error("\n❌ Erro no gerenciamento PPPoE:");

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