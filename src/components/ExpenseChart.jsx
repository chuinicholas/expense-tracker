import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { useExpense } from "../context/ExpenseContext";

export default function ExpenseChart() {
  const { expenses } = useExpense();

  const getDailyData = () => {
    const dailyExpenses = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount;
    });

    return Object.entries(dailyExpenses).map(([date, amount]) => ({
      date,
      amount,
    }));
  };

  return (
    <Box
      sx={{
        height: 400,
        p: 3,
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
        border: "1px solid rgba(148, 163, 184, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: "primary.light",
        }}
      >
        Daily Expenses
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={getDailyData()}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.2)"
          />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              color: "#f1f5f9",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ fill: "#60a5fa" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
