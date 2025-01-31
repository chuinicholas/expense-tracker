import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  LinearProgress,
  Grid,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useExpense } from "../context/ExpenseContext";
import AchievementSystem from "./achievements/AchievementSystem";

export default function Budget() {
  const {
    budgets,
    addBudget,
    updateBudget,
    removeBudget,
    expenses,
    expenseCategories,
    incomes,
  } = useExpense();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly",
  });
  const [periodFilter, setPeriodFilter] = useState("all");
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [existingBudget, setExistingBudget] = useState(null);
  const [pendingBudget, setPendingBudget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.amount || !newBudget.period) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const budgetToSave = {
        ...newBudget,
        amount: parseFloat(newBudget.amount),
      };

      // Check for existing budget with same category and period
      const existing = budgets.find(
        (budget) =>
          budget.category === budgetToSave.category &&
          budget.period === budgetToSave.period
      );

      if (existing && !editingBudget) {
        setExistingBudget(existing);
        setDuplicateDialog(true);
        return;
      }

      if (editingBudget) {
        await updateBudget({ ...budgetToSave, id: editingBudget.id });
      } else {
        await addBudget(budgetToSave);
      }
      handleCloseDialog();
    } catch (error) {
      setError(error.message || "Failed to save budget");
    }
  };

  const handleEditExisting = () => {
    setEditingBudget(existingBudget);
    setNewBudget({
      category: existingBudget.category,
      amount: existingBudget.amount.toString(),
      period: existingBudget.period,
    });
    setDuplicateDialog(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
    setNewBudget({
      category: "",
      amount: "",
      period: "monthly",
    });
    setError("");
  };

  const calculateProgress = (budget) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const relevantExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        (budget.period === "monthly"
          ? expenseDate >= startOfMonth
          : expenseDate >= startOfYear) && expense.category === budget.category
      );
    });

    const totalSpent = relevantExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    return (totalSpent / budget.amount) * 100;
  };

  // Separate budgets by period
  const monthlyBudgets = budgets.filter(
    (budget) => budget.period === "monthly"
  );
  const yearlyBudgets = budgets.filter((budget) => budget.period === "yearly");

  // Filter based on selected period
  const displayMonthly = periodFilter === "all" || periodFilter === "monthly";
  const displayYearly = periodFilter === "all" || periodFilter === "yearly";

  // Calculate total expenses per category
  const categoryExpenses = expenseCategories.reduce((acc, category) => {
    const categoryTotal = expenses
      ? expenses
          .filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0)
      : 0;

    return {
      ...acc,
      [category]: categoryTotal,
    };
  }, {});

  const handleSetBudget = () => {
    if (!selectedCategory || !budgetAmount) {
      setError("Please fill in all fields");
      return;
    }

    addBudget({
      category: selectedCategory,
      amount: parseFloat(budgetAmount),
      period: "monthly",
    });

    setOpenDialog(false);
    setSelectedCategory("");
    setBudgetAmount("");
    setError("");
  };

  // Helper function to format amounts
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        mt: { xs: "60px", sm: 0 },
      }}
    >
      <Stack spacing={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" component="h1">
              Budget Tracking
            </Typography>
            <TextField
              select
              size="small"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <FilterListIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            >
              <MenuItem value="all">All Budgets</MenuItem>
              <MenuItem value="monthly">Monthly Only</MenuItem>
              <MenuItem value="yearly">Yearly Only</MenuItem>
            </TextField>
          </Stack>
          <Button
            variant="contained"
            onClick={() => {
              setEditingBudget(null);
              setNewBudget({ category: "", amount: "", period: "monthly" });
              setOpenDialog(true);
            }}
          >
            Add New Budget
          </Button>
        </Stack>

        {/* Monthly Budgets Section */}
        {displayMonthly && (
          <Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <CalendarMonthIcon sx={{ color: "primary.light" }} />
              <Typography variant="h6" color="primary.light">
                Monthly Budgets
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {monthlyBudgets.map((budget) => {
                const progress = calculateProgress(budget);
                const isOverBudget = progress > 100;

                return (
                  <Grid item xs={12} md={6} key={budget.id}>
                    <Paper
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "primary.light",
                        borderRadius: 2,
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "4px",
                          height: "100%",
                          backgroundColor: "primary.light",
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CalendarMonthIcon
                              sx={{ color: "primary.light" }}
                            />
                            <Typography variant="h6">
                              {budget.category}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label="Monthly"
                              size="small"
                              color="primary"
                              sx={{
                                fontWeight: "medium",
                                minWidth: 80,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingBudget(budget);
                                setNewBudget(budget);
                                setOpenDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => removeBudget(budget.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          Budget: ${formatAmount(budget.amount)}
                        </Typography>

                        <Box sx={{ width: "100%" }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: isOverBudget
                                  ? "error.main"
                                  : "primary.main",
                              },
                            }}
                          />
                        </Box>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            color={
                              isOverBudget ? "error.main" : "text.secondary"
                            }
                          >
                            {progress.toFixed(1)}% Used
                          </Typography>
                          <Typography
                            variant="body2"
                            color={isOverBudget ? "error.main" : "primary.main"}
                          >
                            {isOverBudget
                              ? "Over Budget"
                              : `$${(
                                  budget.amount -
                                  (progress / 100) * budget.amount
                                ).toFixed(2)} Remaining`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
              {monthlyBudgets.length === 0 && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "primary.light",
                      borderRadius: 2,
                    }}
                  >
                    <Typography color="text.secondary">
                      No monthly budgets set. Click "Add New Budget" to get
                      started.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Yearly Budgets Section */}
        {displayYearly && (
          <Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <CalendarTodayIcon sx={{ color: "secondary.light" }} />
              <Typography variant="h6" color="secondary.light">
                Yearly Budgets
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {yearlyBudgets.map((budget) => {
                const progress = calculateProgress(budget);
                const isOverBudget = progress > 100;

                return (
                  <Grid item xs={12} md={6} key={budget.id}>
                    <Paper
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "secondary.light",
                        borderRadius: 2,
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "4px",
                          height: "100%",
                          backgroundColor: "secondary.light",
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CalendarTodayIcon
                              sx={{ color: "secondary.light" }}
                            />
                            <Typography variant="h6">
                              {budget.category}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label="Yearly"
                              size="small"
                              color="secondary"
                              sx={{
                                fontWeight: "medium",
                                minWidth: 80,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingBudget(budget);
                                setNewBudget(budget);
                                setOpenDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => removeBudget(budget.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          Budget: ${formatAmount(budget.amount)}
                        </Typography>

                        <Box sx={{ width: "100%" }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: isOverBudget
                                  ? "error.main"
                                  : "secondary.main",
                              },
                            }}
                          />
                        </Box>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            color={
                              isOverBudget ? "error.main" : "text.secondary"
                            }
                          >
                            {progress.toFixed(1)}% Used
                          </Typography>
                          <Typography
                            variant="body2"
                            color={
                              isOverBudget ? "error.main" : "secondary.main"
                            }
                          >
                            {isOverBudget
                              ? "Over Budget"
                              : `$${(
                                  budget.amount -
                                  (progress / 100) * budget.amount
                                ).toFixed(2)} Remaining`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
              {yearlyBudgets.length === 0 && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "secondary.light",
                      borderRadius: 2,
                    }}
                  >
                    <Typography color="text.secondary">
                      No yearly budgets set. Click "Add New Budget" to get
                      started.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Show this only when no budgets match the filter */}
        {budgets.length === 0 && (
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography color="text.secondary">
              No budgets set. Click "Add New Budget" to get started.
            </Typography>
          </Paper>
        )}
      </Stack>

      <AchievementSystem
        budgets={budgets}
        expenses={expenses}
        incomes={incomes}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingBudget ? "Edit Budget" : "Add New Budget"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={newBudget.category}
                onChange={handleChange}
                label="Category"
              >
                {expenseCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Budget Amount"
              name="amount"
              type="number"
              value={newBudget.amount}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />

            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                name="period"
                value={newBudget.period}
                onChange={handleChange}
                label="Period"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddBudget} variant="contained">
            {editingBudget ? "Update" : "Add"} Budget
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Budget Dialog */}
      <Dialog open={duplicateDialog} onClose={() => setDuplicateDialog(false)}>
        <DialogTitle>Budget Already Exists</DialogTitle>
        <DialogContent>
          <Typography>
            A {existingBudget?.period} budget for {existingBudget?.category}{" "}
            already exists with an amount of $
            {formatAmount(existingBudget?.amount)}.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Would you like to edit the existing budget instead?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog(false)}>Cancel</Button>
          <Button onClick={handleEditExisting} variant="contained">
            Edit Existing Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
