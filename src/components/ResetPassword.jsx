import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import AnimatedBackground from "./AnimatedBackground";
import { keyframes } from "@mui/system";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (error) {
      setError("Failed to reset password");
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
        }}
      >
        <Stack spacing={3}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            color="primary.light"
          >
            Reset Password
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <Typography
            variant="body2"
            color="rgba(255, 255, 255, 0.7)"
            align="center"
          >
            Enter your email address and we'll send you instructions to reset
            your password.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{
                  py: 1.5,
                  bgcolor: "primary.light",
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                }}
              >
                Reset Password
              </Button>
            </Stack>
          </form>

          <Stack direction="row" spacing={1} justifyContent="center">
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
              Remember your password?
            </Typography>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary.light">
                Sign in
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
