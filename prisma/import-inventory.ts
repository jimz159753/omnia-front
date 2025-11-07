import { PrismaClient } from "../src/generated/prisma";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper function to parse currency strings
function parseCurrency(value: string): number {
  if (!value || value.trim() === "") return 0;
  // Remove currency symbol, spaces, and commas
  const cleaned = value.replace(/[$,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse stock
function parseStock(value: string): number {
  if (!value || value.trim() === "") return 0;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

async function importInventory() {
  console.log("📦 Starting inventory import from CSV...\n");

  try {
    // Read CSV file
    const csvPath = path.join(process.cwd(), "public", "inventario.csv");
    const fileContent = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV - skip first line and use second line as headers
    const lines = fileContent.split("\n");
    const csvWithoutFirstLine = lines.slice(1).join("\n");

    const records = parse(csvWithoutFirstLine, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    console.log(`Found ${records.length} records in CSV\n`);

    // Get all categories and providers
    const categories = await prisma.category.findMany();
    const providers = await prisma.provider.findMany();

    const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

    console.log(`Found ${categories.length} categories`);
    console.log(`Found ${providers.length} providers\n`);

    // Clear existing inventory
    console.log("🗑️  Clearing existing inventory...");
    await prisma.inventory.deleteMany({});
    console.log("✓ Cleared existing inventory\n");

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Import records
    for (const record of records) {
      const code = (record as Record<string, string>)["Código"];
      const name = (record as Record<string, string>)["Descripción"];
      const providerCost = parseCurrency(
        (record as Record<string, string>)["Costo proveedor"]
      );
      const price = parseCurrency(
        (record as Record<string, string>)["Precio Venta"]
      );
      const stock = parseStock(
        (record as Record<string, string>)["Piezas disponibles"]
      );
      const categoryName = (record as Record<string, string>)["Categoria"];

      // Skip if no code or name
      if (!code || !name) {
        errorCount++;
        errors.push(`Skipping record with missing code or name`);
        continue;
      }

      // Get category ID
      const categoryId = categoryMap.get(categoryName);
      if (!categoryId) {
        errorCount++;
        errors.push(
          `Category "${categoryName}" not found for item: ${code} - ${name}`
        );
        continue;
      }

      try {
        await prisma.inventory.create({
          data: {
            code,
            name,
            description: name, // Using name as description
            providerCost,
            price,
            stock,
            categoryId,
          },
        });
        successCount++;

        if (successCount % 50 === 0) {
          console.log(`✓ Imported ${successCount} items...`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Error importing ${code} - ${name}: ${error}`);
      }
    }

    console.log("\n📊 Import Summary:");
    console.log(`✅ Successfully imported: ${successCount} items`);
    console.log(`❌ Failed: ${errorCount} items`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log("\n⚠️  Errors:");
      errors.forEach((err) => console.log(`  - ${err}`));
    } else if (errors.length > 10) {
      console.log(`\n⚠️  ${errors.length} errors occurred (showing first 10):`);
      errors.slice(0, 10).forEach((err) => console.log(`  - ${err}`));
    }

    console.log("\n🎉 Import completed!");
  } catch (error) {
    console.error("❌ Error during import:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importInventory();
