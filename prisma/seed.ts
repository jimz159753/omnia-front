import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Producto",
    description: "Productos físicos y artículos de venta",
  },
  {
    name: "Curso/Taller",
    description: "Cursos y talleres educativos",
  },
  {
    name: "Renta de Espacio",
    description: "Alquiler de espacios y salones",
  },
  {
    name: "Cosmetologia",
    description: "Servicios de cosmetología y belleza",
  },
  {
    name: "Masaje",
    description: "Servicios de masajes terapéuticos",
  },
  {
    name: "Evento",
    description: "Organización y realización de eventos",
  },
  {
    name: "Reiki",
    description: "Servicios de Reiki y sanación energética",
  },
  {
    name: "Tarot",
    description: "Lecturas de tarot y consultas",
  },
  {
    name: "Otros",
    description: "Otros servicios y productos",
  },
];

const providers = [
  {
    name: "Omnia",
    ownerName: "Omnia",
    description: "Proveedor principal",
  },
  {
    name: "Paula Valencia",
    ownerName: "Paula Valencia",
    description: "Proveedor de servicios",
  },
  {
    name: "Wushcraft",
    ownerName: "Wushcraft",
    description: "Proveedor de servicios",
  },
  {
    name: "Indi",
    ownerName: "Indi",
    description: "Proveedor de servicios",
  },
  {
    name: "Lucerna",
    ownerName: "Lucerna",
    description: "Proveedor de servicios",
  },
  {
    name: "Moonspell",
    ownerName: "Moonspell",
    description: "Proveedor de servicios",
  },
  {
    name: "iizax",
    ownerName: "iizax",
    description: "Proveedor de servicios",
  },
  {
    name: "Minerva Becerra",
    ownerName: "Minerva Becerra",
    description: "Proveedor de servicios",
  },
  {
    name: "Ale Villaruel",
    ownerName: "Ale Villaruel",
    description: "Proveedor de servicios",
  },
  {
    name: "Pilar Anguiano",
    ownerName: "Pilar Anguiano",
    description: "Proveedor de servicios",
  },
  {
    name: "Esther Masajista",
    ownerName: "Esther",
    description: "Proveedor de masajes",
  },
  {
    name: "Vero Masajista",
    ownerName: "Vero",
    description: "Proveedor de masajes",
  },
  {
    name: "Susana Gamez",
    ownerName: "Susana Gamez",
    description: "Proveedor de servicios",
  },
  {
    name: "Oracula",
    ownerName: "Oracula",
    description: "Proveedor de servicios",
  },
  {
    name: "Labrador",
    ownerName: "Labrador",
    description: "Proveedor de servicios",
  },
  {
    name: "Carla Yoga",
    ownerName: "Carla",
    description: "Proveedor de yoga",
  },
];

// SubCategories mapped to their parent categories
const subCategories: Record<string, { name: string; description: string }[]> = {
  Producto: [
    { name: "Esoterico", description: "Productos esotéricos" },
    { name: "Herbolaria", description: "Productos de herbolaria" },
    { name: "Decoracion", description: "Artículos de decoración" },
    { name: "Velas", description: "Velas y aromaterapia" },
    { name: "Cafe", description: "Café y bebidas" },
    { name: "Joyeria", description: "Joyería y accesorios" },
  ],
  Cosmetologia: [
    { name: "Cosmetologico", description: "Servicios cosmetológicos" },
    { name: "Facial", description: "Tratamientos faciales" },
    { name: "Corporales", description: "Tratamientos corporales" },
    { name: "Masajes", description: "Masajes terapéuticos" },
    { name: "Depilacion Laser", description: "Depilación láser" },
    { name: "Depilacion Cera", description: "Depilación con cera" },
    { name: "Pestañas", description: "Tratamiento de pestañas" },
    { name: "Diseño Pestañas", description: "Diseño de pestañas" },
    { name: "Peptonas", description: "Tratamiento con peptonas" },
    { name: "Eliminacion Tattoos", description: "Eliminación de tatuajes" },
  ],
  "Renta de Espacio": [
    { name: "Renta de Espacio", description: "Alquiler de espacios" },
  ],
  Reiki: [{ name: "Reiki", description: "Sesiones de Reiki" }],
  Tarot: [{ name: "Tarot", description: "Lecturas de tarot" }],
  Otros: [{ name: "Otro", description: "Otros servicios y productos" }],
};

async function main() {
  console.log("🌱 Starting seed...");

  // Seed Categories
  console.log("\n📦 Seeding categories...");
  const existingCategories = await prisma.category.findMany();

  if (existingCategories.length > 0) {
    console.log("⚠️  Categories already exist. Skipping categories.");
    console.log(`Found ${existingCategories.length} existing categories.`);
  } else {
    // Create categories
    for (const category of categories) {
      const created = await prisma.category.create({
        data: category,
      });
      console.log(`✅ Created category: ${created.name}`);
    }
    console.log(`✓ Created ${categories.length} categories`);
  }

  // Seed SubCategories
  console.log("\n🏷️  Seeding subcategories...");
  const existingSubCategories = await prisma.subCategory.findMany();

  if (existingSubCategories.length > 0) {
    console.log("⚠️  SubCategories already exist. Skipping subcategories.");
    console.log(
      `Found ${existingSubCategories.length} existing subcategories.`
    );
  } else {
    // Get all categories to map subcategories
    const allCategories = await prisma.category.findMany();
    const categoryMap = new Map(allCategories.map((cat) => [cat.name, cat.id]));

    let totalSubCategories = 0;

    // Create subcategories for each category
    for (const [categoryName, subCats] of Object.entries(subCategories)) {
      const categoryId = categoryMap.get(categoryName);

      if (!categoryId) {
        console.log(
          `⚠️  Category "${categoryName}" not found. Skipping its subcategories.`
        );
        continue;
      }

      for (const subCat of subCats) {
        const created = await prisma.subCategory.create({
          data: {
            name: subCat.name,
            description: subCat.description,
            categoryId: categoryId,
          },
        });
        console.log(
          `✅ Created subcategory: ${created.name} (under ${categoryName})`
        );
        totalSubCategories++;
      }
    }

    console.log(`✓ Created ${totalSubCategories} subcategories`);
  }

  // Seed Providers
  console.log("\n🏢 Seeding providers...");
  const existingProviders = await prisma.provider.findMany();

  if (existingProviders.length > 0) {
    console.log("⚠️  Providers already exist. Skipping providers.");
    console.log(`Found ${existingProviders.length} existing providers.`);
  } else {
    // Create providers
    for (const provider of providers) {
      const created = await prisma.provider.create({
        data: provider,
      });
      console.log(`✅ Created provider: ${created.name}`);
    }
    console.log(`✓ Created ${providers.length} providers`);
  }

  // Seed Sample Inventory
  console.log("\n📦 Seeding sample inventory...");
  const existingInventory = await prisma.inventory.findMany();

  if (existingInventory.length > 0) {
    console.log("⚠️  Inventory already exists. Skipping inventory.");
    console.log(`Found ${existingInventory.length} existing inventory items.`);
  } else {
    // Get all categories to create sample inventory
    const allCategories = await prisma.category.findMany();

    if (allCategories.length === 0) {
      console.log("⚠️  No categories found. Cannot create inventory.");
    } else {
      const sampleInventory = [
        {
          name: "Vela de Lavanda",
          description: "Vela aromática de lavanda para relajación",
          stock: 25,
          price: 150.0,
          categoryId:
            allCategories.find((c) => c.name === "Producto")?.id ||
            allCategories[0].id,
          code: "VL001",
          providerCost: 80.0,
        },
        {
          name: "Tarot Rider-Waite",
          description: "Mazo de tarot clásico Rider-Waite",
          stock: 15,
          price: 350.0,
          categoryId:
            allCategories.find((c) => c.name === "Producto")?.id ||
            allCategories[0].id,
          code: "TR001",
          providerCost: 200.0,
        },
        {
          name: "Aceite Esencial Rosa",
          description: "Aceite esencial de rosa para aromaterapia",
          stock: 8,
          price: 280.0,
          categoryId:
            allCategories.find((c) => c.name === "Producto")?.id ||
            allCategories[0].id,
          code: "AE001",
          providerCost: 150.0,
        },
        {
          name: "Cristal Cuarzo",
          description: "Cristal de cuarzo transparente",
          stock: 50,
          price: 120.0,
          categoryId:
            allCategories.find((c) => c.name === "Producto")?.id ||
            allCategories[0].id,
          code: "CR001",
          providerCost: 60.0,
        },
        {
          name: "Café Orgánico",
          description: "Café orgánico de comercio justo 250g",
          stock: 40,
          price: 180.0,
          categoryId:
            allCategories.find((c) => c.name === "Producto")?.id ||
            allCategories[0].id,
          code: "CF001",
          providerCost: 100.0,
        },
      ];

      for (const item of sampleInventory) {
        const created = await prisma.inventory.create({
          data: item,
        });
        console.log(`✅ Created inventory item: ${created.name}`);
      }
      console.log(`✓ Created ${sampleInventory.length} inventory items`);
    }
  }

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
