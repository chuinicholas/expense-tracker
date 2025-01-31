import { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { useExpense } from "../context/ExpenseContext";

export default function ExpenseForm() {
  const {
    addExpense,
    expenseCategories,
    addExpenseCategory,
    removeExpenseCategory,
  } = useExpense();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || !description || !category || !date) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting expense data:", {
        amount,
        description,
        category,
        date,
      });

      const expenseData = {
        amount: parseFloat(amount),
        description,
        category,
        date,
      };

      const result = await addExpense(expenseData);
      console.log("Expense added successfully:", result);

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setError("");
      setOpenDialog(false);
    } catch (error) {
      console.error("Detailed error in ExpenseForm:", error);
      setError(error.message || "Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await addExpenseCategory(newCategory.trim());
      setNewCategory("");
      setOpenDialog(false);
    } catch (error) {
      setError("Failed to add category. Please try again.");
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    try {
      await removeExpenseCategory(categoryToDelete);
      if (category === categoryToDelete) {
        setCategory("");
      }
    } catch (error) {
      setError("Failed to delete category. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
          />

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {expenseCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <IconButton
              onClick={() => setOpenDialog(true)}
              sx={{
                color: "primary.main",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  color: "primary.dark",
                  transform: "scale(1.2)",
                  background: "none",
                },
              }}
              disableRipple
            >
              <AddCircleOutlineIcon />
            </IconButton>
            <IconButton
              onClick={() => setOpenManageDialog(true)}
              sx={{
                color: "primary.main",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  color: "primary.dark",
                  transform: "scale(1.2)",
                  background: "none",
                },
              }}
              disableRipple
            >
              <SettingsIcon />
            </IconButton>
          </Stack>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </Stack>
      </form>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCategory}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openManageDialog}
        onClose={() => setOpenManageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Expense Categories</DialogTitle>
        <DialogContent>
          <List>
            {expenseCategories.map((cat) => (
              <ListItem key={cat}>
                <ListItemText primary={cat} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteCategory(cat)}
                    sx={{
                      color: "primary.main",
                      "&:hover": { color: "primary.dark" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
