import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

// GET - Fetch transactions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "income" or "expense"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = end;
      }
    }

    // Get total count
    const total = await (await getPrisma()).cashTransaction.count({ where });

    // Get paginated transactions
    const transactions = await (await getPrisma()).cashTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Calculate totals for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await (await getPrisma()).cashTransaction.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const todayIncome = todayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = todayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate all-time totals
    const allIncome = await (await getPrisma()).cashTransaction.aggregate({
      where: { type: "income" },
      _sum: { amount: true },
    });

    const allExpenses = await (await getPrisma()).cashTransaction.aggregate({
      where: { type: "expense" },
      _sum: { amount: true },
    });

    const totalIncome = allIncome._sum.amount || 0;
    const totalExpenses = allExpenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      summary: {
        todayIncome,
        todayExpenses,
        todayBalance: todayIncome - todayExpenses,
        totalIncome,
        totalExpenses,
        balance,
      },
    });
  } catch (error) {
    console.error("Error fetching cash transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, description, category, paymentMethod, reference, notes, userId } = body;

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: "Type, amount, and description are required" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'income' or 'expense'" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const transaction = await (await getPrisma()).cashTransaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category: category || "general",
        paymentMethod: paymentMethod || "cash",
        reference: reference || null,
        notes: notes || null,
        userId: userId || "system",
      },
    });

    return NextResponse.json(
      { data: transaction, message: "Transaction created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating cash transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a transaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await (await getPrisma()).cashTransaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting cash transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
