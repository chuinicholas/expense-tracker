import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { useExpense } from "../context/ExpenseContext";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";

export default function TransactionList() {
  const {
    expenses,
    incomes,
    expenseCategories,
    incomeCategories,
    removeExpense,
    removeIncome,
  } = useExpense();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Combine expenses and incomes into a single array
  const allTransactions = [
    ...expenses.map((expense) => ({
      ...expense,
      type: "expense",
    })),
    ...incomes.map((income) => ({
      ...income,
      type: "income",
    })),
  ];

  // Get all months for the dropdown (January to December)
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return {
      value: String(i + 1).padStart(2, "0"), // '01' to '12'
      label: date.toLocaleString("default", { month: "long" }),
    };
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format date for comparison
  const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Filter transactions based on search criteria
  const filteredTransactions = allTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = String(transactionDate.getMonth() + 1).padStart(
        2,
        "0"
      );

      const matchesDescription = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !searchCategory || transaction.category === searchCategory;
      const matchesDate = !searchDate || transaction.date === searchDate;
      const matchesMonth = !selectedMonth || transactionMonth === selectedMonth;
      const matchesType =
        transactionType === "all" || transaction.type === transactionType;

      return (
        matchesDescription &&
        matchesCategory &&
        matchesDate &&
        matchesMonth &&
        matchesType
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredTransactions.map((transaction) => ({
      Date: formatDate(transaction.date),
      Description: transaction.description,
      Category: transaction.category,
      Type: transaction.type === "expense" ? "Expense" : "Income",
      Income: transaction.type === "income" ? transaction.amount : "",
      Expense: transaction.type === "expense" ? transaction.amount : "",
    }));

    // Calculate totals
    const totals = {
      Date: "TOTAL",
      Description: "",
      Category: "",
      Type: "",
      Income: excelData.reduce((sum, row) => sum + (row.Income || 0), 0),
      Expense: excelData.reduce((sum, row) => sum + (row.Expense || 0), 0),
    };

    // Add totals row
    excelData.push(totals);

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 30 }, // Description
      { wch: 15 }, // Category
      { wch: 10 }, // Type
      { wch: 12 }, // Income
      { wch: 12 }, // Expense
    ];
    ws["!cols"] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    // Generate Excel file
    const fileName = `transactions_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) {
      setDeleteDialogOpen(false);
      return;
    }

    setLoading(true);
    try {
      if (selectedExpense.type === "income") {
        await removeIncome(selectedExpense.id);
      } else {
        await removeExpense(selectedExpense.id);
      }
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
      setError("");
    } catch (error) {
      setError(`Failed to delete ${selectedExpense.type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    if (loading) return; // Prevent closing while deleting
    setDeleteDialogOpen(false);
    setSelectedExpense(null);
    setError("");
  };

  return (
    <Box sx={{ mt: 4, px: { xs: 1, sm: 0 } }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          border: "1px solid rgba(148, 163, 184, 0.1)",
          overflow: "hidden",
        }}
      >
        <Stack spacing={2}>
          {/* Search and Filter Section */}
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size={isMobile ? "small" : "medium"}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {transactionType !== "income" &&
                    expenseCategories.map((category) => (
                      <MenuItem key={`expense-${category}`} value={category}>
                        {category} (Expense)
                      </MenuItem>
                    ))}
                  {transactionType !== "expense" &&
                    incomeCategories.map((category) => (
                      <MenuItem key={`income-${category}`} value={category}>
                        {category} (Income)
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Month"
                >
                  <MenuItem value="">All Months</MenuItem>
                  {allMonths.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={transactionType}
                  onChange={(e) => {
                    setTransactionType(e.target.value);
                    setSearchCategory(""); // Reset category when changing type
                  }}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="expense">Expenses</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <TextField
                type="date"
                label="Date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={exportToExcel}
                sx={{
                  bgcolor: "primary.light",
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                  whiteSpace: "nowrap",
                }}
                size={isMobile ? "small" : "medium"}
              >
                Export
              </Button>
            </Stack>
          </Stack>

          {/* Transactions List */}
          {isMobile ? (
            // Mobile view - Card layout
            <Stack spacing={1} sx={{ mt: 1 }}>
              {filteredTransactions.length === 0 ? (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  No transactions found
                </Typography>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderLeft: 3,
                        borderLeftColor:
                          transaction.type === "expense"
                            ? "error.main"
                            : "success.main",
                      }}
                    >
                      <CardContent sx={{ p: "8px !important" }}>
                        <Stack spacing={0.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="body1"
                              component="div"
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                lineHeight: 1.2,
                              }}
                            >
                              {transaction.description}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="body1"
                                color={
                                  transaction.type === "expense"
                                    ? "error.main"
                                    : "success.main"
                                }
                                sx={{
                                  fontWeight: "500",
                                  fontSize: "0.9rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ${transaction.amount.toFixed(2)}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(transaction);
                                }}
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": {
                                    color: "error.main",
                                  },
                                  padding: 0.5,
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Stack>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ flexWrap: "wrap", gap: 0.5 }}
                          >
                            <Chip
                              label={transaction.category}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: "20px",
                                "& .MuiChip-label": {
                                  px: 1,
                                  py: 0,
                                },
                              }}
                            />
                            <Chip
                              label={
                                transaction.type === "expense"
                                  ? "Expense"
                                  : "Income"
                              }
                              color={
                                transaction.type === "expense"
                                  ? "error"
                                  : "success"
                              }
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: "20px",
                                "& .MuiChip-label": {
                                  px: 1,
                                  py: 0,
                                },
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.7rem" }}
                            >
                              {formatDate(transaction.date)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </Stack>
          ) : (
            // Desktop view - Table layout
            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            transaction.type === "expense"
                              ? "Expense"
                              : "Income"
                          }
                          color={
                            transaction.type === "expense" ? "error" : "success"
                          }
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            transaction.type === "expense"
                              ? "error.main"
                              : "success.main",
                          fontWeight: "medium",
                        }}
                      >
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleDeleteClick(transaction)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              color: "error.main",
                            },
                            transition: "color 0.2s",
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          disableEscapeKeyDown={loading}
          PaperProps={{
            sx: {
              width: "100%",
              maxWidth: { xs: "calc(100% - 32px)", sm: 400 },
              m: { xs: 2, sm: "auto" },
            },
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this{" "}
              {selectedExpense?.type || "transaction"}?
            </Typography>
            {selectedExpense && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Description: {selectedExpense.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: ${selectedExpense.amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDate(selectedExpense.date)}
                </Typography>
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
