import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../context/AuthContext";
import AnimatedBackground from "./AnimatedBackground";
import { keyframes } from "@mui/system";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Form validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (!formData.displayName.trim()) {
      return setError("Name is required");
    }

    try {
      setError("");
      setLoading(true);
      await signup(formData.email, formData.password, formData.displayName);
      navigate("/app");
    } catch (error) {
      setError(
        error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/app");
    } catch (error) {
      setError("Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatedBackground />
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          animation: `${float} 3s ease-in-out infinite`,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.4)",
            },
          },
          "& .MuiTypography-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiDivider-root": {
            "&::before, &::after": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          },
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                helperText="Must be at least 6 characters"
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                error={
                  formData.password !== formData.confirmPassword &&
                  formData.confirmPassword !== ""
                }
                helperText={
                  formData.password !== formData.confirmPassword &&
                  formData.confirmPassword !== ""
                    ? "Passwords do not match"
                    : " "
                }
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{
                  mt: 2,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Divider>or</Divider>

          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignUp}
            disabled={loading}
            fullWidth
          >
            Sign up with Google
          </Button>

          <Stack direction="row" spacing={1} justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Sign in
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
