import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  Zoom,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ProfileSkeleton from "./ProfileSkeleton";

export default function Profile() {
  const {
    currentUser,
    updateUserEmail,
    updateUserPassword,
    updateUserProfile,
  } = useAuth();
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openNameDialog, setOpenNameDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [authInProgress, setAuthInProgress] = useState(false);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.altKey) {
        switch (e.key) {
          case "n":
            setOpenNameDialog(true);
            break;
          case "e":
            setOpenEmailDialog(true);
            break;
          case "p":
            setOpenPasswordDialog(true);
            break;
          case "h":
            setShowTour(true);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateUserProfile({
        displayName: newDisplayName.trim(),
      });
      setSuccess("Name updated successfully!");
      setOpenNameDialog(false);
    } catch (error) {
      setError(error.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateUserEmail(newEmail);
      setSuccess("Email updated successfully!");
      setOpenEmailDialog(false);
      setNewEmail("");
    } catch (error) {
      setError(error.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateUserPassword(passwords.newPassword);
      setSuccess("Password updated successfully!");
      setOpenPasswordDialog(false);
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      setError(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    setSnackbar({ open: true, message });
  };

  const handlePasswordVisibility = () => {
    if (!showPassword && !currentPassword) {
      setOpenAuthDialog(true);
    } else {
      setShowPassword(!showPassword);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthInProgress(true);
    setError("");

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        authPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      setCurrentPassword(authPassword);
      setShowPassword(true);
      setOpenAuthDialog(false);
      setAuthPassword("");
    } catch (error) {
      setError("Incorrect password. Please try again.");
    } finally {
      setAuthInProgress(false);
    }
  };

  const MotionCard = motion(Card);
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderPasswordDialog = () => (
    <Dialog
      open={openPasswordDialog}
      onClose={() => setOpenPasswordDialog(false)}
    >
      <DialogTitle>Update Password</DialogTitle>
      <DialogContent>
        <form onSubmit={handlePasswordUpdate}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.new ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.confirm ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
        <Button
          onClick={handlePasswordUpdate}
          variant="contained"
          disabled={loading}
        >
          Update Password
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderAuthDialog = () => (
    <Dialog open={openAuthDialog} onClose={() => setOpenAuthDialog(false)}>
      <form onSubmit={handleAuthSubmit}>
        <DialogTitle>Verify Your Identity</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter your password to view it
          </Typography>
          <TextField
            label="Password"
            type={showAuthPassword ? "text" : "password"}
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    edge="end"
                  >
                    {showAuthPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuthDialog(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={authInProgress}>
            Verify
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <Box
      sx={{ maxWidth: 800, mx: "auto", p: 3 }}
      role="main"
      aria-label="Profile page"
    >
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 2 }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={4}>
          {/* Profile Header */}
          <Box sx={{ textAlign: "center" }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "2.5rem",
                  cursor: "pointer",
                }}
                aria-label="Profile picture"
              >
                {currentUser?.displayName?.charAt(0) || "U"}
              </Avatar>
            </motion.div>
            <Typography variant="h4" gutterBottom>
              {currentUser?.displayName || "User"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Member since{" "}
              {new Date(
                currentUser?.metadata?.creationTime
              ).toLocaleDateString()}
            </Typography>
          </Box>

          <Divider />

          {/* Profile Information Cards */}
          <Stack spacing={3}>
            {[
              {
                icon: <PersonIcon color="primary" />,
                title: "Display Name",
                value: currentUser?.displayName || "Not set",
                action: () => setOpenNameDialog(true),
                shortcut: "Alt + N",
                tourStep: 1,
              },
              {
                icon: <EmailIcon color="primary" />,
                title: "Email Address",
                value: currentUser?.email,
                action: () => setOpenEmailDialog(true),
                shortcut: "Alt + E",
                tourStep: 2,
              },
              {
                icon: <SecurityIcon color="primary" />,
                title: "Password",
                value: (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" component="span">
                      {showPassword ? currentPassword : "••••••••"}
                    </Typography>
                    <IconButton
                      onClick={handlePasswordVisibility}
                      size="small"
                      disabled={authInProgress}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Stack>
                ),
                action: () => setOpenPasswordDialog(true),
                shortcut: "Alt + P",
                tourStep: 3,
              },
            ].map((item, index) => (
              <MotionCard
                key={item.title}
                variant="outlined"
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.2 }}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                component={motion.div}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {item.icon}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.title}
                        </Typography>
                        <Typography variant="h6">{item.value}</Typography>
                      </Box>
                    </Stack>
                    <Tooltip
                      title={`Edit ${item.title} (${item.shortcut})`}
                      TransitionComponent={Zoom}
                    >
                      <IconButton
                        onClick={item.action}
                        color="primary"
                        aria-label={`Edit ${item.title}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </MotionCard>
            ))}
          </Stack>

          {/* Help Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Tooltip title="Show Keyboard Shortcuts (Alt + H)">
              <IconButton
                color="primary"
                onClick={() => setShowTour(true)}
                aria-label="Show help"
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>

      {/* Update Name Dialog */}
      <Dialog open={openNameDialog} onClose={() => setOpenNameDialog(false)}>
        <form onSubmit={handleNameUpdate}>
          <DialogTitle>Update Display Name</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Display Name"
              fullWidth
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNameDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
        <form onSubmit={handleEmailUpdate}>
          <DialogTitle>Update Email</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Email"
              type="email"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmailDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {renderPasswordDialog()}
      {renderAuthDialog()}

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
