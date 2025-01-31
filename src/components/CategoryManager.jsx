import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useExpense } from "../context/ExpenseContext";

export default function CategoryManager({ open, onClose }) {
  const { categories, addCategory, deleteCategory } = useExpense();
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      setError("Category already exists");
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory("");
    setError("");
  };

  const handleDeleteCategory = (category) => {
    if (category === "Others") {
      setError("Cannot delete 'Others' category");
      return;
    }
    deleteCategory(category);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          minWidth: "300px",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" color="primary.light">
          Manage Categories
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value);
              setError("");
            }}
            placeholder="New category name"
            error={!!error}
            helperText={error}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
            sx={{ mt: 1 }}
            fullWidth
          >
            Add Category
          </Button>
        </Box>

        <List>
          {categories.map((category) => (
            <ListItem key={category} sx={{ py: 1 }}>
              <ListItemText primary={category} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteCategory(category)}
                  disabled={category === "Others"}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
