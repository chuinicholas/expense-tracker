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

export default function IncomeForm() {
  const {
    addIncome,
    incomeCategories,
    addIncomeCategory,
    deleteIncomeCategory,
  } = useExpense();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !description || !date) return;

    setLoading(true);
    try {
      await addIncome({
        amount: parseFloat(amount),
        category,
        description,
        date,
      });
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error adding income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addIncomeCategory(newCategory.trim());
      setNewCategory("");
      setOpenDialog(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    deleteIncomeCategory(categoryToDelete);
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
              inputProps: { min: 0, step: "0.01" },
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
              {incomeCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <IconButton
              onClick={() => setOpenDialog(true)}
              sx={{
                color: "success.main",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  color: "success.dark",
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
                color: "success.main",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  color: "success.dark",
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
            color="success"
          >
            {loading ? "Adding..." : "Add Income"}
          </Button>
        </Stack>
      </form>

      {/* Add Category Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Income Category</DialogTitle>
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
          <Button
            onClick={handleAddCategory}
            variant="contained"
            color="success"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog
        open={openManageDialog}
        onClose={() => setOpenManageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Income Categories</DialogTitle>
        <DialogContent>
          <List>
            {incomeCategories.map((cat) => (
              <ListItem key={cat}>
                <ListItemText primary={cat} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteCategory(cat)}
                    sx={{
                      color: "success.main",
                      "&:hover": { color: "success.dark" },
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
