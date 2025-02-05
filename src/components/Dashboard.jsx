import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  MenuItem,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fab,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useExpense } from "../context/ExpenseContext";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import CategorySpendingChart from "./CategorySpendingChart";

export default function Dashboard() {
  const {
    expenses = [],
    incomes = [],
    addExpense,
    addIncome,
    expenseCategories = [],
    incomeCategories = [],
    addExpenseCategory,
    removeExpenseCategory,
    addIncomeCategory,
    removeIncomeCategory,
  } = useExpense();
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [newCategory, setNewCategory] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: expenseCategories[0] || "",
    date: new Date().toISOString().split("T")[0],
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Update category when categories change
  useEffect(() => {
    if (expenseCategories.length > 0 && !newTransaction.category) {
      setNewTransaction((prev) => ({
        ...prev,
        category: expenseCategories[0],
      }));
    }
  }, [expenseCategories]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const amount = parseFloat(newTransaction.amount);
    if (transactionType === "expense") {
      await addExpense({
        ...newTransaction,
        amount,
      });
    } else {
      await addIncome({
        ...newTransaction,
        amount,
      });
    }
    setOpenTransactionDialog(false);
    setNewTransaction({
      description: "",
      amount: "",
      category: expenseCategories[0] || "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      if (transactionType === "expense") {
        await addExpenseCategory(newCategory.trim());
      } else {
        await addIncomeCategory(newCategory.trim());
      }
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      if (transactionType === "expense") {
        await removeExpenseCategory(category);
      } else {
        await removeIncomeCategory(category);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Update the categories array based on transaction type
  const categories =
    transactionType === "expense" ? expenseCategories : incomeCategories;

  // Calculate totals directly
  const totalExpenses = expenses.reduce(
    (total, expense) => total + (expense?.amount || 0),
    0
  );
  const totalIncome = incomes.reduce(
    (total, income) => total + (income?.amount || 0),
    0
  );
  const balance = totalIncome - totalExpenses;

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "calc(100vh - 56px)", sm: "auto" }, // Account for mobile header
        mb: { xs: 0, sm: 4 },
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Financial Summary Box */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 1.5, sm: 3 },
          mb: { xs: 1, sm: 3 },
          borderRadius: 2,
          background: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Stack spacing={{ xs: 1, sm: 2 }}>
          {/* Balance */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: "white",
            }}
          >
            <Stack spacing={0.5} alignItems="center">
              <AccountBalanceIcon
                sx={{ fontSize: { xs: 32, sm: 40 }, opacity: 0.9 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.75rem", sm: "2.125rem" },
                }}
              >
                ${balance.toFixed(2)}
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Current Balance
              </Typography>
            </Stack>
          </Box>

          {/* Income and Expenses Summary */}
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={1}
            sx={{ width: "100%" }}
          >
            {/* Income Summary */}
            <Paper
              elevation={1}
              sx={{
                p: { xs: 1, sm: 2 },
                flex: 1,
                borderRadius: 2,
                bgcolor: "success.light",
                color: "white",
              }}
            >
              <Stack spacing={0.5} alignItems="center">
                <TrendingUpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  ${totalIncome.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Total Income
                </Typography>
              </Stack>
            </Paper>

            {/* Expenses Summary */}
            <Paper
              elevation={1}
              sx={{
                p: { xs: 1, sm: 2 },
                flex: 1,
                borderRadius: 2,
                bgcolor: "error.light",
                color: "white",
              }}
            >
              <Stack spacing={0.5} alignItems="center">
                <TrendingDownIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  ${totalExpenses.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Total Expenses
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      {/* Add Category Management Button and Add Transaction Button */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: { xs: 1, sm: 3 },
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<CategoryIcon />}
          onClick={() => setOpenCategoryDialog(true)}
          size={isMobile ? "small" : "medium"}
        >
          Manage Categories
        </Button>

        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenTransactionDialog(true)}
          >
            Add Transaction
          </Button>
        )}
      </Stack>

      {/* Category Spending Chart */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 1, sm: 3 },
          borderRadius: 2,
          background: theme.palette.background.paper,
          flex: 1,
          minHeight: 0,
          maxHeight: { xs: "45vh", sm: "400px" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <CategorySpendingChart />
        </Box>
      </Paper>

      {/* Add Transaction FAB for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.fab,
          }}
          onClick={() => setOpenTransactionDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Transaction Dialog */}
      <Dialog
        open={openTransactionDialog}
        onClose={() => setOpenTransactionDialog(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: { xs: "100%", sm: 600 },
            m: { xs: 0, sm: 2 },
            height: isMobile ? "100%" : "auto",
          },
        }}
      >
        {isMobile && (
          <AppBar position="sticky" sx={{ bgcolor: "background.paper" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setOpenTransactionDialog(false)}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
                Add Transaction
              </Typography>
              <Button color="inherit" onClick={handleAddTransaction}>
                Save
              </Button>
            </Toolbar>
          </AppBar>
        )}

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Transaction Type Tabs */}
            <Tabs
              value={transactionType}
              onChange={(e, newValue) => setTransactionType(newValue)}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab
                label="Expense"
                value="expense"
                icon={<TrendingDownIcon />}
                iconPosition="start"
              />
              <Tab
                label="Income"
                value="income"
                icon={<TrendingUpIcon />}
                iconPosition="start"
              />
            </Tabs>

            <TextField
              label="Description"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
              fullWidth
              required
            />

            <TextField
              label="Amount"
              type="number"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, amount: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                startAdornment: "$",
              }}
            />

            {categories.length > 0 && (
              <TextField
                select
                label="Category"
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
                fullWidth
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              type="date"
              label="Date"
              value={newTransaction.date}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, date: e.target.value })
              }
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>

        {!isMobile && (
          <DialogActions>
            <Button onClick={() => setOpenTransactionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction} variant="contained">
              Add {transactionType === "expense" ? "Expense" : "Income"}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: { xs: "100%", sm: 500 },
            m: { xs: 0, sm: 2 },
            height: isMobile ? "auto" : "auto",
            maxHeight: isMobile ? "calc(100% - 32px)" : "auto",
            position: "relative",
            top: isMobile ? "16px" : "auto",
            borderRadius: isMobile ? "16px 16px 0 0" : 2,
          },
        }}
      >
        {isMobile ? (
          <AppBar
            position="sticky"
            sx={{
              bgcolor: "background.paper",
              borderRadius: "16px 16px 0 0",
            }}
            elevation={0}
          >
            <Toolbar sx={{ minHeight: 52 }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setOpenCategoryDialog(false)}
              >
                <CloseIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ ml: 2, flex: 1, fontSize: "1.125rem" }}
              >
                Manage Categories
              </Typography>
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle>Manage Categories</DialogTitle>
        )}

        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Stack spacing={2} sx={{ mt: isMobile ? 1 : 2 }}>
            {/* Add New Category */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Add New Category
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  size={isMobile ? "small" : "medium"}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Category List */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Existing Categories
              </Typography>
              <List dense={isMobile}>
                {categories.map((category) => (
                  <ListItem
                    key={category}
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      mb: 1,
                      py: isMobile ? 0.5 : 1,
                    }}
                  >
                    <ListItemText
                      primary={category}
                      primaryTypographyProps={{
                        fontSize: isMobile ? "0.875rem" : "1rem",
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteCategory(category)}
                        size="small"
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        </DialogContent>

        {!isMobile && (
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Close</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}
