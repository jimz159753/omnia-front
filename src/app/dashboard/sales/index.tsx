import { Button, Grid, Typography } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import GeneticDataGrid from "@/components/GeneticDataGrid";
import { expensesColumns } from "./ColumnsGrid/expensesColumns";
import { salesColumns } from "./ColumnsGrid/salesColumns";
import { useState, useEffect } from "react";
import { salesData, expensesData } from "@/mock/data";
import { ISales, IExpenses } from "@/constants";

const Sales = () => {
  const [sales, setSales] = useState<ISales[]>([]);
  const [expenses, setExpenses] = useState<IExpenses[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSales(salesData);
    setExpenses(expensesData);
    setIsLoading(false);
  };

  console.log(sales);
  console.log(expenses);

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Grid
          size={12}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5">Ventas</Typography>
            <Button variant="outlined" color="inherit">
              Agregar venta
            </Button>
          </div>
          <GeneticDataGrid
            loading={isLoading}
            sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
            data={sales}
            columns={salesColumns() as GridColDef<GridValidRowModel>[]}
          />
        </Grid>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">Gastos</Typography>
          <Button variant="outlined" color="inherit">
            Agregar gasto
          </Button>
        </div>
        <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={expenses}
          columns={expensesColumns() as GridColDef<GridValidRowModel>[]}
        />
      </Grid>
    </Grid>
  );
};

export default Sales;
