import { Box, Paper, Typography, Grid } from "@mui/material";
import { useExpense } from "../context/ExpenseContext";

export default function MonthlyStats() {
  const { expenses } = useExpense();

  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().getMonth();
    return expenses.filter(
      (expense) => new Date(expense.date).getMonth() === currentMonth
    );
  };

  const calculateTotal = () => {
    return getCurrentMonthExpenses()
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2);
  };

  const getBiggestCategory = () => {
    const categoryTotals = {};
    getCurrentMonthExpenses().forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    );

    return sortedCategories[0]
      ? `${sortedCategories[0][0]} ($${sortedCategories[0][1].toFixed(2)})`
      : "No expenses";
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            mb: 3,
            color: "primary.light",
          }}
        >
          Monthly Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(96, 165, 250, 0.15)", // Lighter blue with opacity
                border: "1px solid rgba(96, 165, 250, 0.3)",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                Total Spent
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.light" }}
              >
                ${calculateTotal()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(244, 114, 182, 0.15)", // Lighter pink with opacity
                border: "1px solid rgba(244, 114, 182, 0.3)",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                Biggest Category
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "secondary.light" }}
              >
                {getBiggestCategory()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
