import { Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useExpense } from "../context/ExpenseContext";

export default function CategoryPieChart() {
  const { expenses } = useExpense();

  // Updated colors for dark theme
  const COLORS = [
    "#60a5fa",
    "#f472b6",
    "#4ade80",
    "#fb923c",
    "#a78bfa",
    "#facc15",
  ];

  const getCategoryData = () => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 1.5,
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 1,
            color: "text.primary",
          }}
        >
          <Typography sx={{ color: payload[0].payload.fill }}>
            {payload[0].name}: ${payload[0].value.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
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
        Expenses by Category
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={getCategoryData()}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {getCategoryData().map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: "#f1f5f9" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
