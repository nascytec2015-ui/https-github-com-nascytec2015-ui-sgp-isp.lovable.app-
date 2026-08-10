import "dotenv/config";

import { MikroTikService } from "./src/services/mikrotik";

async function main() {
    const mikrotik = new MikroTikService();

    try {
        console.log("🔌 Conectando ao MikroTik...");

        await mikrotik.connect();

        console.log("✅ Conectado!");

        console.log("\n📡 Buscando usuários PPPoE...\n");

        const users = await mikrotik.getPPPUsers();

        console.table(users);

        console.log(`\n✅ Total de PPPoE encontrados: ${users.length}`);
    } catch (error) {
        console.error("\n❌ Erro no teste PPPoE:");

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

main();