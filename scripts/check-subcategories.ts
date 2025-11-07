import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function checkSubCategories() {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: {
        category: true,
      },
    });

    console.log(`Total SubCategories: ${subCategories.length}\n`);

    // Group by categoryId
    const grouped = subCategories.reduce((acc, sub) => {
      const catId = sub.categoryId;
      if (!acc[catId]) {
        acc[catId] = [];
      }
      acc[catId].push(sub);
      return acc;
    }, {} as Record<string, typeof subCategories>);

    // Check for duplicates
    const duplicates = Object.entries(grouped).filter(
      ([_, subs]) => subs.length > 1
    );

    if (duplicates.length > 0) {
      console.log(
        `⚠️  Found ${duplicates.length} categories with multiple subcategories:\n`
      );
      duplicates.forEach(([catId, subs]) => {
        console.log(`Category: ${subs[0].category.name}`);
        subs.forEach((sub) => {
          console.log(`  - ${sub.name} (ID: ${sub.id})`);
        });
        console.log();
      });
    } else {
      console.log(
        "✅ No duplicate subcategories found. Safe to proceed with migration."
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubCategories();
