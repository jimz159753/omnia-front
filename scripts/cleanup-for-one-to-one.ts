import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("⚠️  WARNING: This will delete data to enforce one-to-one relationships!");
  console.log("⚠️  Each category will keep only ONE inventory item and ONE subcategory.\n");

  try {
    // Clean up SubCategories - keep only first one per category
    console.log("🧹 Cleaning up subcategories...");
    const subCategories = await prisma.subCategory.findMany({
      orderBy: { createdAt: "asc" },
    });

    const subCatGrouped = subCategories.reduce((acc, sub) => {
      if (!acc[sub.categoryId]) {
        acc[sub.categoryId] = [];
      }
      acc[sub.categoryId].push(sub);
      return acc;
    }, {} as Record<string, typeof subCategories>);

    let deletedSubCats = 0;
    for (const [catId, subs] of Object.entries(subCatGrouped)) {
      if (subs.length > 1) {
        const toDelete = subs.slice(1);
        console.log(`Category ${catId}: Keeping "${subs[0].name}", deleting ${toDelete.length} others`);
        
        for (const sub of toDelete) {
          await prisma.subCategory.delete({ where: { id: sub.id } });
          deletedSubCats++;
        }
      }
    }
    console.log(`✓ Deleted ${deletedSubCats} duplicate subcategories\n`);

    // Clean up Inventory - keep only first one per category
    console.log("🧹 Cleaning up inventory items...");
    const inventory = await prisma.inventory.findMany({
      orderBy: { createdAt: "asc" },
      include: { category: true },
    });

    const invGrouped = inventory.reduce((acc, inv) => {
      if (!acc[inv.categoryId]) {
        acc[inv.categoryId] = [];
      }
      acc[inv.categoryId].push(inv);
      return acc;
    }, {} as Record<string, typeof inventory>);

    let deletedInv = 0;
    for (const [catId, items] of Object.entries(invGrouped)) {
      if (items.length > 1) {
        const toDelete = items.slice(1);
        console.log(
          `Category "${items[0].category.name}": Keeping "${items[0].name}", deleting ${toDelete.length} others`
        );
        
        for (const item of toDelete) {
          await prisma.inventory.delete({ where: { id: item.id } });
          deletedInv++;
        }
      }
    }
    console.log(`✓ Deleted ${deletedInv} duplicate inventory items\n`);

    console.log("✅ Cleanup complete!");
    console.log(`📊 Summary:`);
    console.log(`   - Deleted ${deletedSubCats} subcategories`);
    console.log(`   - Deleted ${deletedInv} inventory items`);
    console.log(`   - Remaining: ${Object.keys(invGrouped).length} inventory items (one per category)`);
    console.log(`   - Remaining: ${Object.keys(subCatGrouped).length} subcategories (one per category)`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

