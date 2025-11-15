import { PrismaClient } from "../src/generated/prisma";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper function to parse currency strings (e.g., "$1,000.00" -> 1000.00)
function parseCurrency(value: string): number {
  if (!value || value === "FALSE" || value === "") return 0;
  // Remove currency symbols, commas, and convert to number
  const cleaned = value.replace(/[$,]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse date (format: d/M/yyyy)
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// Helper function to parse boolean
function parseBoolean(value: string): boolean {
  return value === "TRUE" || value === "true" || value === "1";
}

async function importSales() {
  console.log("🌱 Starting sales import...");

  const csvPath = path.join(__dirname, "../public/ventas.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found:", csvPath);
    return;
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const lines = fileContent.split("\n");

  // Skip the first 4 lines (headers and empty rows)
  const dataLines = lines.slice(4);

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();

    // Skip empty lines
    if (!line || line === ",,,,,,,FALSE,,,FALSE,,,,,,,,,,,") {
      skipped++;
      continue;
    }

    // Parse CSV line (simple split by comma - may need improvement for complex cases)
    const columns = line.split(",");

    // Skip if we don't have enough columns or if the date is missing
    if (columns.length < 22 || !columns[0]) {
      skipped++;
      continue;
    }

    const [
      fecha,
      cliente,
      codigo,
      descripcion,
      unidades,
      precioUnitario,
      precioTotal,
      descuento,
      descuentoPorcentaje,
      precioFinal,
      pagoConTarjeta,
      ingresoReal,
      estatusPago,
      metodoPago,
      cuenta,
      vendedor,
      categoria,
      subCategoria,
      proveedor,
      costoProveedor,
      estatusPagoProveedor,
      comentarios,
    ] = columns;

    try {
      // Create sale record
      await prisma.sale.create({
        data: {
          date: parseDate(fecha),
          client: cliente || "General",
          code: codigo || "N/A",
          description: descripcion || "N/A",
          units: parseInt(unidades) || 1,
          unitPrice: parseCurrency(precioUnitario),
          totalPrice: parseCurrency(precioTotal),
          hasDiscount: parseBoolean(descuento),
          discountPercentage: descuentoPorcentaje
            ? parseFloat(descuentoPorcentaje.replace("%", ""))
            : null,
          finalPrice: parseCurrency(precioFinal),
          cardPayment: parseBoolean(pagoConTarjeta),
          realIncome: parseCurrency(ingresoReal),
          paymentStatus: estatusPago || "Pendiente",
          paymentMethod: metodoPago || "N/A",
          account: cuenta || "N/A",
          seller: vendedor || "N/A",
          category: categoria || "Otros",
          subCategory: subCategoria || null,
          provider: proveedor || "N/A",
          providerCost: parseCurrency(costoProveedor),
          providerPaymentStatus: estatusPagoProveedor || "Pendiente",
          comments: comentarios || null,
        },
      });

      imported++;
      console.log(
        `✅ Imported sale ${imported}: ${cliente} - ${descripcion} (${fecha})`
      );
    } catch (error) {
      console.error(`❌ Error importing line ${i + 5}:`, error);
      skipped++;
    }
  }

  console.log(`\n🎉 Import completed!`);
  console.log(`✓ Imported: ${imported} sales`);
  console.log(`⚠️  Skipped: ${skipped} records`);
}

importSales()
  .catch((e) => {
    console.error("❌ Error during import:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
