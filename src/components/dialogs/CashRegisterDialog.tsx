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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl bg-omnia-light border-omnia-navy/20 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-6 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FiCreditCard className="w-5 h-5 text-white" />
              </div>
              Caja Registradora
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Summary Cards */}
        {summary && (
          <div className="px-6 py-6 bg-omnia-light/50 border-b border-omnia-navy/10">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-omnia-navy/5 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 text-omnia-blue mb-2">
                  <div className="w-7 h-7 rounded-lg bg-omnia-blue/10 flex items-center justify-center">
                    <FiTrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Ingresos Hoy</span>
                </div>
                <p className="text-2xl font-black text-omnia-dark">
                  {formatCurrency(summary.todayIncome)}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-omnia-navy/5 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <FiTrendingDown className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Egresos Hoy</span>
                </div>
                <p className="text-2xl font-black text-omnia-dark">
                  {formatCurrency(summary.todayExpenses)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-omnia-dark to-omnia-navy rounded-2xl p-5 shadow-lg shadow-omnia-dark/10 border border-white/10 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2 text-white/70 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <FiDollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Balance Total</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4 bg-white border-b border-omnia-navy/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all duration-300 ${
                activeTab === "summary"
                  ? "bg-omnia-light border-x border-t border-omnia-navy/10 -mb-px text-omnia-navy shadow-[0_-4px_10px_rgba(0,0,0,0.03)]"
                  : "text-omnia-navy/40 hover:text-omnia-navy hover:bg-omnia-navy/5"
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
              className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === "income"
                  ? "bg-omnia-light border-x border-t border-omnia-navy/10 -mb-px text-omnia-blue shadow-[0_-4px_10px_rgba(0,0,0,0.03)]"
                  : "text-omnia-navy/40 hover:text-omnia-blue hover:bg-omnia-blue/5"
              }`}
            >
              <FiPlus className="w-4 h-4" />
              Ingreso
            </button>
            <button
              onClick={() => {
                setActiveTab("expense");
                setFormType("expense");
                setCategory("");
              }}
              className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === "expense"
                  ? "bg-omnia-light border-x border-t border-omnia-navy/10 -mb-px text-rose-500 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]"
                  : "text-omnia-navy/40 hover:text-rose-500 hover:bg-rose-500/5"
              }`}
            >
              <FiPlus className="w-4 h-4" />
              Egreso
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "summary" ? (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-omnia-navy uppercase tracking-wider">Últimos Movimientos</h3>
                <button
                  onClick={fetchTransactions}
                  className="px-3 py-1.5 rounded-lg bg-omnia-navy/5 text-xs font-bold text-omnia-navy hover:bg-omnia-navy/10 transition-all flex items-center gap-2"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-omnia-blue"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No hay movimientos registrados
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white border border-omnia-navy/5 shadow-sm transition-all hover:bg-omnia-light/40 group/item"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            tx.type === "income"
                              ? "bg-omnia-blue/10 text-omnia-blue"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <FiTrendingUp className="w-5 h-5 transition-transform group-hover/item:scale-110" />
                          ) : (
                            <FiTrendingDown className="w-5 h-5 transition-transform group-hover/item:scale-110" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-omnia-navy">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] items-center px-1.5 py-0.5 rounded bg-omnia-navy/5 text-omnia-navy/60 font-bold uppercase tracking-wider">
                              {tx.paymentMethod === "cash" ? "Efectivo" : tx.paymentMethod === "card" ? "Tarjeta" : "Transferencia"}
                            </span>
                            <span className="text-xs text-omnia-navy/40">
                              {formatDate(tx.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <p
                          className={`text-lg font-black ${
                            tx.type === "income" ? "text-omnia-blue" : "text-rose-600"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-omnia-navy/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-omnia-navy/10 shadow-sm">
                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${formType === "income" ? "text-omnia-blue" : "text-rose-600"}`}>
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formType === "income" ? "bg-omnia-blue/10" : "bg-rose-500/10"}`}>
                    {formType === "income" ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                   </div>
                  {formType === "income" ? "Registrar Nuevo Ingreso" : "Registrar Nuevo Egreso"}
                </h3>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omnia-navy/60 uppercase tracking-wider">
                      Monto <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-omnia-navy/40 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-omnia-navy/10 focus:outline-none focus:ring-2 focus:ring-omnia-blue bg-omnia-light/30 font-bold text-omnia-navy placeholder-omnia-navy/30 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omnia-navy/60 uppercase tracking-wider">
                      Categoría <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-omnia-navy/10 focus:outline-none focus:ring-2 focus:ring-omnia-blue bg-omnia-light/30 font-semibold text-omnia-navy transition-all appearance-none"
                    >
                      <option value="">Seleccionar categoría</option>
                      {(formType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-omnia-navy/60 uppercase tracking-wider">
                      Descripción <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-omnia-navy/10 focus:outline-none focus:ring-2 focus:ring-omnia-blue bg-omnia-light/30 font-semibold text-omnia-navy placeholder-omnia-navy/30 transition-all"
                      placeholder="Ej: Insumos de limpieza, Venta de productos..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omnia-navy/60 uppercase tracking-wider">
                      Método de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-omnia-navy/10 focus:outline-none focus:ring-2 focus:ring-omnia-blue bg-omnia-light/30 font-semibold text-omnia-navy transition-all appearance-none"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omnia-navy/60 uppercase tracking-wider">
                      Notas
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-omnia-navy/10 focus:outline-none focus:ring-2 focus:ring-omnia-blue bg-omnia-light/30 font-semibold text-omnia-navy placeholder-omnia-navy/30 transition-all"
                      placeholder="Detalles adicionales..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("summary");
                    }}
                    className="px-6 py-3 text-sm font-bold text-omnia-navy/60 bg-white border-2 border-omnia-navy/5 rounded-xl hover:bg-omnia-navy/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-lg flex items-center gap-3 ${
                      formType === "income"
                        ? "bg-omnia-blue hover:bg-omnia-blue/90 shadow-omnia-blue/20"
                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    } disabled:opacity-50`}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FiPlus className="w-5 h-5" />
                    )}
                    {formType === "income" ? "Completar Registro" : "Registrar Gasto"}
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
