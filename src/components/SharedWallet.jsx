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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  AvatarGroup,
  Tooltip,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

export default function SharedWallet() {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [openNewWalletDialog, setOpenNewWalletDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [newWalletData, setNewWalletData] = useState({
    name: "",
    description: "",
    budget: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user's shared wallets
  useEffect(() => {
    const fetchWallets = () => {
      const walletsRef = collection(db, "sharedWallets");
      const q = query(
        walletsRef,
        where("members", "array-contains", currentUser.email)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const walletsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWallets(walletsData);
      });

      return unsubscribe;
    };

    if (currentUser) {
      return fetchWallets();
    }
  }, [currentUser]);

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    setError("");

    if (!newWalletData.name.trim()) {
      setError("Wallet name is required");
      return;
    }

    try {
      if (!currentUser) {
        throw new Error("You must be logged in to create a wallet");
      }

      const walletData = {
        name: newWalletData.name.trim(),
        description: newWalletData.description.trim() || "",
        createdBy: currentUser.email,
        members: [currentUser.email],
        createdAt: new Date().toISOString(),
        expenses: [],
        totalSpent: 0,
      };

      console.log("Creating wallet with data:", walletData);

      const docRef = await addDoc(collection(db, "sharedWallets"), walletData);
      console.log("Wallet created with ID:", docRef.id);

      setSuccess("Shared wallet created successfully!");
      setOpenNewWalletDialog(false);
      setNewWalletData({ name: "", description: "", budget: "" });
    } catch (error) {
      console.error("Error creating wallet:", error);
      setError("Failed to create shared wallet: " + error.message);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setError("");

    if (!inviteEmail.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const walletRef = doc(db, "sharedWallets", selectedWallet.id);
      await updateDoc(walletRef, {
        members: [...selectedWallet.members, inviteEmail.trim()],
      });

      setSuccess("Invitation sent successfully!");
      setOpenInviteDialog(false);
      setInviteEmail("");
    } catch (error) {
      setError("Failed to invite member: " + error.message);
    }
  };

  const handleDeleteWallet = async (walletId) => {
    if (
      !window.confirm("Are you sure you want to delete this shared wallet?")
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "sharedWallets", walletId));
      setSuccess("Wallet deleted successfully!");
    } catch (error) {
      setError("Failed to delete wallet: " + error.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
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

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">Shared Wallets</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewWalletDialog(true)}
          >
            Create New Wallet
          </Button>
        </Stack>

        {wallets.length === 0 ? (
          <Typography color="text.secondary" align="center">
            You don't have any shared wallets yet. Create one to get started!
          </Typography>
        ) : (
          <List>
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
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
                      <Typography variant="h6" component="div">
                        {wallet.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {wallet.description}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          mt={1}
                        >
                          <Chip
                            label={`Spent: $${wallet.totalSpent.toFixed(2)}`}
                            color="secondary"
                            variant="outlined"
                          />
                          <AvatarGroup max={4}>
                            {wallet.members.map((member) => (
                              <Tooltip key={member} title={member}>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {member[0].toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                        </Stack>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setOpenInviteDialog(true);
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                      {wallet.createdBy === currentUser.email && (
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteWallet(wallet.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
            ))}
          </List>
        )}
      </Paper>

      {/* Create New Wallet Dialog */}
      <Dialog
        open={openNewWalletDialog}
        onClose={() => setOpenNewWalletDialog(false)}
      >
        <form onSubmit={handleCreateWallet}>
          <DialogTitle>Create New Shared Wallet</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Wallet Name"
                value={newWalletData.name}
                onChange={(e) =>
                  setNewWalletData({ ...newWalletData, name: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={newWalletData.description}
                onChange={(e) =>
                  setNewWalletData({
                    ...newWalletData,
                    description: e.target.value,
                  })
                }
                fullWidth
                multiline
                rows={2}
                placeholder="Optional: Add a description for this shared wallet"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewWalletDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog
        open={openInviteDialog}
        onClose={() => setOpenInviteDialog(false)}
      >
        <form onSubmit={handleInviteMember}>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogContent>
            <TextField
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              fullWidth
              required
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Invite
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
