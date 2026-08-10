import { MikroTikClient } from "./src/services/mikrotik/MikroTikClient";

const USERNAME = "teste-sgp";

async function main() {
    const client = new MikroTikClient({
        host: process.env.MIKROTIK_HOST ?? "192.168.1.6",
        port: Number(process.env.MIKROTIK_PORT ?? 8728),
        user: process.env.MIKROTIK_USER ?? "",
        password: process.env.MIKROTIK_PASSWORD ?? "",
        timeout: Number(process.env.MIKROTIK_TIMEOUT ?? 10),
        tls: process.env.MIKROTIK_TLS === "true",
    });

    try {
        console.log("🔌 Conectando ao MikroTik...");

        await client.connect();

        console.log("✅ Conectado!");

        console.log("\n🔎 Procurando usuário PPPoE...");

        const user = await client.findPPPUser(USERNAME);

        if (!user) {
            throw new Error(
                `Usuário PPPoE "${USERNAME}" não encontrado no MikroTik.`
            );
        }

        console.log("✅ Usuário encontrado:");
        console.table([user]);

        if (!user.disabled) {
            console.log(
                `\n⚠️ O usuário "${USERNAME}" já está desbloqueado.`
            );
            return;
        }

        console.log("\n🔓 Desbloqueando PPPoE...");
        console.log(`   Usuário: ${USERNAME}`);

        const updatedUser = await client.enablePPPUser(USERNAME);

        console.log("\n✅ Comando de desbloqueio executado!");
        console.table([updatedUser]);

        console.log("\n🔎 Confirmando desbloqueio no RB750...");

        const confirmedUser = await client.findPPPUser(USERNAME);

        if (!confirmedUser) {
            throw new Error(
                `Não foi possível localizar "${USERNAME}" após o desbloqueio.`
            );
        }

        console.table([confirmedUser]);

        if (confirmedUser.disabled) {
            throw new Error(
                `O usuário "${USERNAME}" continua bloqueado no RB750.`
            );
        }

        console.log(
            "\n🎉 Desbloqueio PPPoE confirmado com sucesso no RB750!"
        );
    } catch (error) {
        console.error("\n❌ Erro no teste de desbloqueio:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }

        process.exitCode = 1;
    } finally {
        await client.disconnect();
    }
}

main();