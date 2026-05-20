/**
 * Drops only tcc_ collections in the current MongoDB database.
 * Run with: npx tsx scripts/reset-db.ts
 */
import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ticketflow";
  await mongoose.connect(uri);
  console.log("Connected to", uri);

  const collections = await mongoose.connection.db!.collections();
  for (const collection of collections) {
    if (!collection.collectionName.startsWith("tcc_")) {
      continue;
    }

    await collection.drop();
    console.log("Dropped collection:", collection.collectionName);
  }

  await mongoose.disconnect();
  console.log("Database reset complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
