require("dotenv").config();

const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  const result = await client.query(`
    SELECT
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'clientes'
    ORDER BY ordinal_position
  `);

  console.table(result.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
