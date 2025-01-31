import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useExpense } from "../context/ExpenseContext";

export default function IncomeList() {
  const { incomes, removeIncome } = useExpense();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (income) => {
    setSelectedIncome(income);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIncome) {
      setDeleteDialogOpen(false);
      return;
    }

    setLoading(true);
    try {
      await removeIncome(selectedIncome.id);
      setDeleteDialogOpen(false);
      setSelectedIncome(null);
      setError("");
    } catch (error) {
      setError("Failed to delete income. Please try again.");
      console.error("Error deleting income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    if (loading) return;
    setDeleteDialogOpen(false);
    setSelectedIncome(null);
    setError("");
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No incomes found
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{income.date}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell>{income.category}</TableCell>
                  <TableCell align="right">${income.amount}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleDeleteClick(income)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>Are you sure you want to delete this income?</Typography>
          {selectedIncome && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {selectedIncome.description} - ${selectedIncome.amount}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={loading}
            variant="contained"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
