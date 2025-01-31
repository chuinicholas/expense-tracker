import { useState } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function SharedWalletExpenses({ wallet, onUpdate }) {
  const { currentUser } = useAuth();
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Other",
    paidBy: currentUser.email,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Groceries",
    "Utilities",
    "Rent",
    "Entertainment",
    "Transportation",
    "Other",
  ];

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
        date: new Date(),
        id: Date.now().toString(),
      };

      const walletRef = doc(db, "sharedWallets", wallet.id);
      await updateDoc(walletRef, {
        expenses: arrayUnion(expense),
        totalSpent: wallet.totalSpent + amount,
      });

      setSuccess("Expense added successfully!");
      setOpenExpenseDialog(false);
      setNewExpense({
        description: "",
        amount: "",
        category: "Other",
        paidBy: currentUser.email,
      });
      onUpdate && onUpdate();
    } catch (error) {
      setError("Failed to add expense: " + error.message);
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const walletRef = doc(db, "sharedWallets", wallet.id);
      await updateDoc(walletRef, {
        expenses: arrayRemove(expense),
        totalSpent: wallet.totalSpent - expense.amount,
      });
      setSuccess("Expense deleted successfully!");
      onUpdate && onUpdate();
    } catch (error) {
      setError("Failed to delete expense: " + error.message);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenExpenseDialog(true)}
        >
          Add Expense
        </Button>
      </Stack>

      <List>
        {wallet.expenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ListItem component={Paper} variant="outlined" sx={{ mb: 2, p: 2 }}>
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
                    <Chip label={expense.category} size="small" />
                    <Typography variant="caption" color="text.secondary">
                      Paid by: {expense.paidBy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(expense.date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                }
              />
              {(expense.paidBy === currentUser.email ||
                wallet.createdBy === currentUser.email) && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteExpense(expense)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          </motion.div>
        ))}
      </List>

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
                {categories.map((category) => (
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
                    {member}
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
    </Box>
  );
}
