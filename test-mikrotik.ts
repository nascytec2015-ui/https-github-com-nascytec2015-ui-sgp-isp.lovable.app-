import { RouterOSAPI } from "@fibercom/routeros-api";

async function testarMikroTik() {
    const api = new RouterOSAPI({
        host: "192.168.1.6",
        user: "sgp-api",
        password: "R23f80N19",
        port: 8728,
    });

    try {
        console.log("Conectando ao MikroTik...");

        await api.connect();

        console.log("✅ Conexão com MikroTik estabelecida!");

        const identity = await api.write("/system/identity/print");

        console.log("Identidade do MikroTik:");
        console.log(identity);

        await api.close();

        console.log("✅ Teste concluído com sucesso.");
    } catch (error) {
        console.error("❌ Erro ao conectar/executar comando:");
        console.error(error);

        try {
            await api.close();
        } catch { }
    }
}

testarMikroTik();