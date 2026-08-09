require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await client.connect();

    const result = await client.query(
      `
      UPDATE public.clientes
      SET
        nome = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        nome,
        email,
        telefone,
        updated_at
      `,
      [
        "teste-SYNC-LOCAL",
        "7f59f70c-6e25-4081-9e29-5f4ac24a1b2b",
      ],
    );

    console.table(result.rows);

    if (result.rows.length === 0) {
      console.log("❌ Cliente não encontrado.");
    } else {
      console.log("✅ Cliente atualizado no PostgreSQL local.");
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.end();
  }
}

main();