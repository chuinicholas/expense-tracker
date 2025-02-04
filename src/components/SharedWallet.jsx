import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";
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
import SharedWalletExpenses from "./SharedWalletExpenses";

export default function SharedWallet() {
  const { currentUser, getUserDisplayName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [wallets, setWallets] = useState([]);
  const [openNewWalletDialog, setOpenNewWalletDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedWalletForExpenses, setSelectedWalletForExpenses] =
    useState(null);
  const [newWalletData, setNewWalletData] = useState({
    name: "",
    description: "",
    budget: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberDisplayNames, setMemberDisplayNames] = useState({});
  const [deleteWalletDialog, setDeleteWalletDialog] = useState({
    open: false,
    wallet: null,
  });

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

  // Add this new function to get display name
  const getDisplayNameInitial = (email) => {
    if (memberDisplayNames[email]) {
      return memberDisplayNames[email].charAt(0).toUpperCase();
    }
    // Fallback to email initial if display name is not available
    return email.charAt(0).toUpperCase();
  };

  // Update the fetchDisplayNames function
  useEffect(() => {
    const fetchDisplayNames = async () => {
      const names = {};
      for (const wallet of wallets) {
        for (const memberEmail of wallet.members) {
          if (!names[memberEmail]) {
            if (memberEmail === currentUser.email) {
              names[memberEmail] = currentUser.displayName || memberEmail;
            } else {
              // Fetch display name from Firestore
              const displayName = await getUserDisplayName(memberEmail);
              names[memberEmail] = displayName || memberEmail;
            }
          }
        }
      }
      setMemberDisplayNames(names);
    };

    if (wallets.length > 0) {
      fetchDisplayNames();
    }
  }, [wallets, currentUser, getUserDisplayName]);

  // Handle wallet selection
  const handleWalletSelect = (wallet) => {
    setSelectedWalletForExpenses(wallet);
    navigate(`/app/shared-wallets/${wallet.id}`);
  };

  // Check URL for wallet ID on component mount
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const walletId = pathParts[pathParts.length - 1];

    if (walletId && wallets.length > 0) {
      const wallet = wallets.find((w) => w.id === walletId);
      if (wallet) {
        setSelectedWalletForExpenses(wallet);
      }
    }
  }, [location.pathname, wallets]);

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

  const handleDeleteWallet = async (wallet) => {
    try {
      await deleteDoc(doc(db, "sharedWallets", wallet.id));
      setDeleteWalletDialog({ open: false, wallet: null });
      setSuccess("Wallet deleted successfully!");
      // Navigate back to the wallets list if the deleted wallet was selected
      if (selectedWalletForExpenses?.id === wallet.id) {
        setSelectedWalletForExpenses(null);
        navigate("/app/shared-wallets");
      }
    } catch (error) {
      setError("Failed to delete wallet: " + error.message);
    }
  };

  // Auto-dismiss success messages after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
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
                  sx={{ mb: 2, p: 2, cursor: "pointer" }}
                  onClick={() => handleWalletSelect(wallet)}
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
                          <AvatarGroup max={4}>
                            {wallet.members.map((member) => (
                              <Tooltip
                                key={member}
                                title={memberDisplayNames[member] || member}
                              >
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {getDisplayNameInitial(member)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWallet(wallet);
                          setOpenInviteDialog(true);
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                      {wallet.createdBy === currentUser.email && (
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteWalletDialog({ open: true, wallet });
                          }}
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

      {/* Show expenses when a wallet is selected */}
      {selectedWalletForExpenses && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">
              {selectedWalletForExpenses.name} - Expenses
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSelectedWalletForExpenses(null)}
            >
              Back to Wallets
            </Button>
          </Stack>
          <SharedWalletExpenses
            wallet={selectedWalletForExpenses}
            onUpdate={() => {
              // Refresh the wallets list when an expense is added/deleted
              const updatedWallet = wallets.find(
                (w) => w.id === selectedWalletForExpenses.id
              );
              if (updatedWallet) {
                setSelectedWalletForExpenses(updatedWallet);
              }
            }}
          />
        </Paper>
      )}

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

      {/* Delete Wallet Confirmation Dialog */}
      <Dialog
        open={deleteWalletDialog.open}
        onClose={() => setDeleteWalletDialog({ open: false, wallet: null })}
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
            Delete Shared Wallet
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this shared wallet? This action
            cannot be undone.
          </Typography>
          {deleteWalletDialog.wallet && (
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {deleteWalletDialog.wallet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {deleteWalletDialog.wallet.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AvatarGroup
                    max={3}
                    sx={{ "& .MuiAvatar-root": { width: 24, height: 24 } }}
                  >
                    {deleteWalletDialog.wallet.members.map((member) => (
                      <Tooltip
                        key={member}
                        title={memberDisplayNames[member] || member}
                      >
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {getDisplayNameInitial(member)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                  <Typography variant="caption" color="text.secondary">
                    {deleteWalletDialog.wallet.members.length} members
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteWalletDialog({ open: false, wallet: null })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteWallet(deleteWalletDialog.wallet)}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
