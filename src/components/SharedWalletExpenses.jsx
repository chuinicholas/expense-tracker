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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Alert,
  MenuItem,
  Tooltip,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import { db } from "../config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

const CATEGORY_COLORS = [
  "#2196f3", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Gold
  "#ff7300", // Deep Orange
  "#0088FE", // Light Blue
  "#00C79F", // Light Teal
];

export default function SharedWalletExpenses({ wallet, onUpdate }) {
  const { currentUser, getUserDisplayName } = useAuth();
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [memberDisplayNames, setMemberDisplayNames] = useState({});
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    paidBy: currentUser.email,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expenses, setExpenses] = useState(wallet.expenses || []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    expense: null,
  });
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState({
    open: false,
    category: null,
  });

  // Initialize categories from wallet
  const [allCategories, setAllCategories] = useState(
    wallet.categories || [
      "Groceries",
      "Utilities",
      "Entertainment",
      "Transportation",
    ]
  );

  // Update allCategories when wallet changes
  useEffect(() => {
    setAllCategories(wallet.categories || []);
    // If wallet has no categories, initialize with default ones
    if (!wallet.categories || wallet.categories.length === 0) {
      const defaultCategories = [
        "Groceries",
        "Utilities",
        "Entertainment",
        "Transportation",
      ];
      const walletRef = doc(db, "sharedWallets", wallet.id);
      updateDoc(walletRef, { categories: defaultCategories });
      setAllCategories(defaultCategories);
    }
  }, [wallet.categories, wallet.id]);

  // Auto-dismiss success messages after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Update newExpense category if current category is deleted
  useEffect(() => {
    if (!allCategories.includes(newExpense.category)) {
      setNewExpense((prev) => ({
        ...prev,
        category: allCategories[0] || "",
      }));
    }
  }, [allCategories, newExpense.category]);

  // Fetch display names for members
  useEffect(() => {
    const fetchDisplayNames = async () => {
      const names = {};
      const fetchPromises = wallet.members.map(async (memberEmail) => {
        if (!names[memberEmail]) {
          if (memberEmail === currentUser.email) {
            names[memberEmail] = currentUser.displayName || memberEmail;
          } else {
            const displayName = await getUserDisplayName(memberEmail);
            names[memberEmail] = displayName || memberEmail;
          }
        }
      });

      await Promise.all(fetchPromises);
      setMemberDisplayNames(names);
    };

    fetchDisplayNames();
  }, [wallet.members, currentUser, getUserDisplayName]);

  // Update expenses when wallet changes
  useEffect(() => {
    setExpenses(wallet.expenses || []);
  }, [wallet.expenses]);

  // Update filtered expenses when expenses or selected date changes
  useEffect(() => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);

    const filtered = expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    setFilteredExpenses(filtered);
  }, [expenses, selectedDate]);

  // Calculate total spent for the selected month
  const monthlyTotal = filteredExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Update getCategoryData to include percentage
  const getCategoryData = () => {
    const categoryTotals = {};
    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedData = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / monthlyTotal) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return sortedData;
  };

  // Update the getCategoryColor function
  const getCategoryColor = (categoryName) => {
    // For bar chart data, maintain the order of current spending
    if (filteredExpenses.length > 0) {
      const categoryData = getCategoryData();
      const categoryIndex = categoryData.findIndex(
        (item) => item.name === categoryName
      );
      if (categoryIndex !== -1) {
        return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
      }
    }

    // For categories without expenses, use their position in allCategories
    const index = allCategories.findIndex((cat) => cat === categoryName);
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  };

  // Add a helper function to get display name
  const getDisplayName = (email) => {
    return memberDisplayNames[email] || email;
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const walletRef = doc(db, "sharedWallets", wallet.id);
      const updatedCategories = [...allCategories, newCategory.trim()];
      await updateDoc(walletRef, {
        categories: updatedCategories,
      });

      // Update local state immediately
      setAllCategories(updatedCategories);
      setSuccess("Category added successfully!");
      setOpenCategoryDialog(false);
      setNewCategory("");
      onUpdate && onUpdate();
    } catch (error) {
      setError("Failed to add category: " + error.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError("");

    if (!newExpense.amount || !newExpense.description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const amount = parseFloat(newExpense.amount);
      const expense = {
        ...newExpense,
        amount,
        date: new Date().toISOString(),
        id: Date.now().toString(),
      };

      const walletRef = doc(db, "sharedWallets", wallet.id);
      await updateDoc(walletRef, {
        expenses: arrayUnion(expense),
        totalSpent: wallet.totalSpent + amount,
      });

      // Update both local states immediately
      const updatedExpenses = [...expenses, expense];
      setExpenses(updatedExpenses);

      // Update filtered expenses if the new expense belongs to the selected month
      const expenseDate = parseISO(expense.date);
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);

      if (expenseDate >= startDate && expenseDate <= endDate) {
        setFilteredExpenses([...filteredExpenses, expense]);
      }

      setSuccess("Expense added successfully!");
      setOpenExpenseDialog(false);
      setNewExpense({
        description: "",
        amount: "",
        category: allCategories[0] || "", // Set to first available category
        paidBy: currentUser.email,
      });
      onUpdate && onUpdate();
    } catch (error) {
      setError("Failed to add expense: " + error.message);
    }
  };

  const handleDeleteExpense = async (expense) => {
    try {
      const walletRef = doc(db, "sharedWallets", wallet.id);

      // Get updated expenses array
      const updatedExpenses = expenses.filter((e) => e.id !== expense.id);

      // Update Firestore with the complete expenses array
      await updateDoc(walletRef, {
        expenses: updatedExpenses,
        totalSpent: wallet.totalSpent - expense.amount,
      });

      // Update local states
      setExpenses(updatedExpenses);
      setFilteredExpenses((prev) => prev.filter((e) => e.id !== expense.id));

      setDeleteConfirmDialog({ open: false, expense: null });
      setSuccess("Expense deleted successfully!");
      onUpdate && onUpdate();
    } catch (error) {
      setError("Failed to delete expense: " + error.message);
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    try {
      const walletRef = doc(db, "sharedWallets", wallet.id);
      const updatedCategories = allCategories.filter(
        (category) => category !== categoryToDelete
      );

      if (updatedCategories.length === 0) {
        setError(
          "Cannot delete the last category. At least one category must remain."
        );
        return;
      }

      await updateDoc(walletRef, {
        categories: updatedCategories,
      });

      // Update local state immediately
      setAllCategories(updatedCategories);
      setSuccess("Category deleted successfully!");
      setDeleteCategoryDialog({ open: false, category: null });
      onUpdate && onUpdate();
    } catch (error) {
      setError("Failed to delete category: " + error.message);
    }
  };

  return (
    <Box>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Stack spacing={3}>
        {/* Header Section */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
            {/* Action Buttons and Monthly Total */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  borderRadius: 2,
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5, opacity: 0.9 }}>
                  Monthly Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  ${monthlyTotal.toFixed(2)}
                </Typography>
              </Paper>

              <Stack direction="row" spacing={2}>
                <Tooltip title="Add Expense" arrow placement="top">
                  <IconButton
                    color="primary"
                    onClick={() => setOpenExpenseDialog(true)}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      width: 48,
                      height: 48,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Manage Categories" arrow placement="top">
                  <IconButton
                    color="primary"
                    onClick={() => setOpenCategoryDialog(true)}
                    sx={{
                      bgcolor: "white",
                      border: 1,
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.50",
                      },
                      width: 48,
                      height: 48,
                    }}
                  >
                    <CategoryIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Month Selector */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["month", "year"]}
                label="Select Month"
                minDate={new Date(2024, 0)}
                maxDate={new Date(2034, 11)}
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>

            {/* Add Category Breakdown Chart */}
            {filteredExpenses.length > 0 && (
              <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Spending by Category
                </Typography>
                <Box
                  sx={{
                    height: Math.max(getCategoryData().length * 60, 300),
                    width: "100%",
                  }}
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={getCategoryData()}
                      layout="vertical"
                      margin={{ top: 5, right: 50, left: 100, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        fontSize={12}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        fontSize={12}
                        tick={{ fill: "#666" }}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <Paper
                                elevation={3}
                                sx={(theme) => ({
                                  p: 1.5,
                                  bgcolor:
                                    theme.palette.mode === "dark"
                                      ? "rgba(33, 33, 33, 0.95)"
                                      : "rgba(255, 255, 255, 0.98)",
                                  border: "1px solid",
                                  borderColor: getCategoryColor(data.name),
                                  minWidth: 180,
                                  color: theme.palette.text.primary,
                                })}
                              >
                                <Stack spacing={0.5}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      color: getCategoryColor(data.name),
                                      fontWeight: 600,
                                    }}
                                  >
                                    {data.name}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={(theme) => ({
                                        color: theme.palette.text.primary,
                                      })}
                                    >
                                      Amount:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={(theme) => ({
                                        fontWeight: 500,
                                        color: theme.palette.text.primary,
                                      })}
                                    >
                                      ${data.value.toFixed(2)}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={(theme) => ({
                                        color: theme.palette.text.primary,
                                      })}
                                    >
                                      Percentage:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={(theme) => ({
                                        fontWeight: 500,
                                        color: theme.palette.text.primary,
                                      })}
                                    >
                                      {data.percentage}%
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Paper>
                            );
                          }
                          return null;
                        }}
                        cursor={false}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1000}
                        label={({ x, y, width, height, value }) => {
                          const data = getCategoryData().find(
                            (item) => item.value === value
                          );
                          return data ? (
                            <text
                              x={x + width + 5}
                              y={y + height / 2}
                              fill="#666"
                              fontSize={12}
                              textAnchor="start"
                              dominantBaseline="middle"
                            >
                              {data.percentage}%
                            </text>
                          ) : null;
                        }}
                      >
                        {getCategoryData().map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={getCategoryColor(entry.name)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Total spending this month: ${monthlyTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        </Paper>

        {/* Expenses List */}
        <List sx={{ mt: 2 }}>
          {filteredExpenses.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No expenses found for {format(selectedDate, "MMMM yyyy")}
            </Typography>
          ) : (
            filteredExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ListItem
                  component={Paper}
                  variant="outlined"
                  sx={{ mb: 2, p: 2 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {expense.description}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`$${expense.amount.toFixed(2)}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={expense.category}
                          size="small"
                          sx={{
                            bgcolor: `${getCategoryColor(expense.category)}20`,
                            color: getCategoryColor(expense.category),
                            borderColor: getCategoryColor(expense.category),
                            "& .MuiChip-label": {
                              fontWeight: 500,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Paid by: {getDisplayName(expense.paidBy)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(expense.date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setDeleteConfirmDialog({ open: true, expense })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
            ))
          )}
        </List>
      </Stack>

      {/* Categories Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
      >
        <DialogTitle>Categories</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Existing Categories:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {allCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onDelete={() =>
                    setDeleteCategoryDialog({ open: true, category })
                  }
                  sx={{
                    mb: 1,
                    bgcolor: `${getCategoryColor(category)}20`,
                    color: getCategoryColor(category),
                    borderColor: getCategoryColor(category),
                    "& .MuiChip-label": {
                      fontWeight: 500,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Add New Category:
          </Typography>
          <TextField
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            fullWidth
            required
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Close</Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog
        open={deleteCategoryDialog.open}
        onClose={() => setDeleteCategoryDialog({ open: false, category: null })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "100%",
            maxWidth: 400,
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <DeleteIcon color="error" />
            Delete Category
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this category? Any expenses with
            this category will keep the category name.
          </Typography>
          {deleteCategoryDialog.category && (
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {deleteCategoryDialog.category}
                </Typography>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() =>
              setDeleteCategoryDialog({ open: false, category: null })
            }
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCategory(deleteCategoryDialog.category)}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog
        open={openExpenseDialog}
        onClose={() => setOpenExpenseDialog(false)}
      >
        <form onSubmit={handleAddExpense}>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Description"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                fullWidth
                required
                InputProps={{
                  startAdornment: "$",
                }}
              />
              <TextField
                select
                label="Category"
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, category: e.target.value })
                }
                fullWidth
              >
                {allCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Paid By"
                value={newExpense.paidBy}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, paidBy: e.target.value })
                }
                fullWidth
              >
                {wallet.members.map((member) => (
                  <MenuItem key={member} value={member}>
                    {memberDisplayNames[member] || member}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenExpenseDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Expense
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, expense: null })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "100%",
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <DeleteIcon color="error" />
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this expense?
          </Typography>
          {deleteConfirmDialog.expense && (
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  {deleteConfirmDialog.expense.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`$${deleteConfirmDialog.expense.amount.toFixed(2)}`}
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    label={deleteConfirmDialog.expense.category}
                    size="small"
                  />
                </Stack>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() =>
              setDeleteConfirmDialog({ open: false, expense: null })
            }
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteExpense(deleteConfirmDialog.expense)}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
