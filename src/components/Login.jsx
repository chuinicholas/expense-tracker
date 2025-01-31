import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../context/AuthContext";
import AnimatedBackground from "./AnimatedBackground";
import { keyframes } from "@mui/system";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  // Check for remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    const savedEmail = localStorage.getItem("userEmail");
    if (remembered && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password, rememberMe);
      navigate("/app");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : "Failed to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  async function handleGoogleSignIn() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/app");
    } catch (error) {
      setError("Failed to sign in with Google.");
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
            Welcome Back
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                InputLabelProps={{
                  sx: { color: "primary.light" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
                InputLabelProps={{
                  sx: { color: "primary.light" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: "primary.light",
                      "&.Mui-checked": {
                        color: "primary.light",
                      },
                    }}
                  />
                }
                label="Remember me"
                sx={{
                  color: "primary.light",
                }}
              />
              <Link
                to="/reset-password"
                style={{
                  textDecoration: "none",
                  alignSelf: "flex-end",
                }}
              >
                <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                  Forgot Password?
                </Typography>
              </Link>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Divider>or</Divider>

          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
          >
            Sign in with Google
          </Button>

          <Stack direction="row" spacing={1} justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Sign up
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
