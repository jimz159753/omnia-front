"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiTrash2,
  FiCreditCard,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

interface Summary {
  todayIncome: number;
  todayExpenses: number;
  todayBalance: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface CashRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

const incomeCategories = [
  { value: "sales", label: "Ventas" },
  { value: "tips", label: "Propinas" },
  { value: "services", label: "Servicios" },
  { value: "other_income", label: "Otros ingresos" },
];

const expenseCategories = [
  { value: "supplies", label: "Insumos" },
  { value: "utilities", label: "Servicios (luz, agua, etc.)" },
  { value: "rent", label: "Renta" },
  { value: "payroll", label: "Nómina" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "other_expense", label: "Otros gastos" },
];

const paymentMethods = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
];

export function CashRegisterDialog({
  open,
  onOpenChange,
  userId,
}: CashRegisterDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "income" | "expense">("summary");
  
  // Form state
  const [formType, setFormType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cash-register?pageSize=20");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchTransactions();
    }
  }, [open, fetchTransactions]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    setPaymentMethod("cash");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cash-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          amount: parseFloat(amount),
          description,
          category,
          paymentMethod,
          notes: notes || undefined,
          userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al registrar");
      }

      toast.success(formType === "income" ? "Ingreso registrado" : "Egreso registrado");
      resetForm();
      fetchTransactions();
      setActiveTab("summary");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta transacción?")) return;

    try {
      const res = await fetch(`/api/cash-register?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      toast.success("Transacción eliminada");
      fetchTransactions();
    } catch (error) {
      toast.error("Error al eliminar la transacción");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-brand-500" />
            Caja Registradora
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        {summary && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Ingresos Hoy</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summary.todayIncome)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <FiTrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Egresos Hoy</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(summary.todayExpenses)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-brand-100">
                <div className="flex items-center gap-2 text-brand-600 mb-1">
                  <FiDollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Balance Total</span>
                </div>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-brand-700" : "text-red-700"}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4 border-b">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "summary"
                  ? "bg-white border border-b-white -mb-px text-brand-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Movimientos
            </button>
            <button
              onClick={() => {
                setActiveTab("income");
                setFormType("income");
                setCategory("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                activeTab === "income"
                  ? "bg-white border border-b-white -mb-px text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiPlus className="w-4 h-4" />
              Registrar Ingreso
            </button>
            <button
              onClick={() => {
                setActiveTab("expense");
                setFormType("expense");
                setCategory("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                activeTab === "expense"
                  ? "bg-white border border-b-white -mb-px text-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiPlus className="w-4 h-4" />
              Registrar Egreso
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "summary" ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Últimos Movimientos</h3>
                <button
                  onClick={fetchTransactions}
                  className="text-sm text-gray-500 hover:text-brand-600 flex items-center gap-1"
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No hay movimientos registrados
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        tx.type === "income"
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "income"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <FiTrendingUp className="w-5 h-5" />
                          ) : (
                            <FiTrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(tx.createdAt)} • {tx.paymentMethod === "cash" ? "Efectivo" : tx.paymentMethod === "card" ? "Tarjeta" : "Transferencia"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={`text-lg font-bold ${
                            tx.type === "income" ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`p-4 rounded-lg ${formType === "income" ? "bg-green-50" : "bg-red-50"}`}>
                <h3 className={`text-lg font-semibold mb-4 ${formType === "income" ? "text-green-700" : "text-red-700"}`}>
                  {formType === "income" ? "Nuevo Ingreso" : "Nuevo Egreso"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Monto <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {(formType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Descripción del movimiento"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Método de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Notas
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Notas adicionales (opcional)"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("summary");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${
                      formType === "income"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50`}
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiPlus className="w-4 h-4" />
                    )}
                    {formType === "income" ? "Registrar Ingreso" : "Registrar Egreso"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
