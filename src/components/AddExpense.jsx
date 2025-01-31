import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import { useExpense } from "../context/ExpenseContext";

export default function AddExpense({ open, onClose }) {
  const { addExpense, expenseCategories } = useExpense();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.amount || !formData.category || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      await addExpense(formData);
      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />

            <TextField
              label="Category"
              name="category"
              select
              value={formData.category}
              onChange={handleChange}
              required
              fullWidth
            >
              {expenseCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
