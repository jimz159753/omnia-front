import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function getInventory() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return inventory;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

const Inventory = async () => {
  const data = await getInventory();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your inventory and stock levels
        </p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search by name..."
      />
    </div>
  );
};

export default Inventory;
