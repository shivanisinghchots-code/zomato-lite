import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Is it set in .env.local?");
  process.exit(1);
}

const sql = neon(connectionString);

function rowsOf(result) {
  return Array.isArray(result) ? result : result.rows;
}

async function applyFile(relativePath) {
  const raw = await readFile(path.join(rootDir, relativePath), "utf8");
  const statements = raw
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }
}

try {
  await sql.query("DROP TABLE IF EXISTS reviews");
  await sql.query("DROP TABLE IF EXISTS restaurants");

  await applyFile("db/schema.sql");
  await applyFile("db/seed.sql");

  const restaurants = rowsOf(await sql.query("SELECT * FROM restaurants ORDER BY id"));
  const reviews = rowsOf(
    await sql.query(
      'SELECT id, restaurant_id AS "restaurantId", rating, comment, created_at AS "createdAt" FROM reviews ORDER BY "createdAt"'
    )
  ).map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }),
  }));

  console.log("\nTable: restaurants");
  console.table(restaurants);

  console.log("Table: reviews");
  console.table(reviews);

  console.log("\nDone. Schema applied and seeded.");
} catch (error) {
  console.error("db:setup failed:", error.message);
  process.exit(1);
}
