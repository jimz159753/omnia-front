import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function cleanupSubCategories() {
  try {
    console.log("🧹 Cleaning up subcategories for one-to-one relationship...\n");

    const subCategories = await prisma.subCategory.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by categoryId
    const grouped = subCategories.reduce((acc, sub) => {
      const catId = sub.categoryId;
      if (!acc[catId]) {
        acc[catId] = [];
      }
      acc[catId].push(sub);
      return acc;
    }, {} as Record<string, typeof subCategories>);

    // For each category with multiple subcategories, keep only the first one
    let deletedCount = 0;
    for (const [catId, subs] of Object.entries(grouped)) {
      if (subs.length > 1) {
        const toKeep = subs[0];
        const toDelete = subs.slice(1);

        console.log(`Category ID ${catId}:`);
        console.log(`  Keeping: ${toKeep.name}`);
        console.log(`  Deleting: ${toDelete.map(s => s.name).join(", ")}`);

        for (const sub of toDelete) {
          await prisma.subCategory.delete({
            where: { id: sub.id },
          });
          deletedCount++;
        }
        console.log();
      }
    }

    console.log(`\n✅ Deleted ${deletedCount} duplicate subcategories`);
    console.log(`✅ Each category now has at most one subcategory`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSubCategories();

