import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AnimatedBackground from "./AnimatedBackground";
import { keyframes } from "@mui/system";

export default function LandingPage() {
  const navigate = useNavigate();

  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

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
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
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
        }}
      >
        <Stack spacing={4} alignItems="center">
          <AccountBalanceWalletIcon
            sx={{
              fontSize: 60,
              color: "primary.light",
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary.light"
          >
            Expense Tracker
          </Typography>

          <Typography
            variant="body1"
            color="rgba(255, 255, 255, 0.7)"
            sx={{ mb: 2 }}
          >
            Take control of your finances with our easy-to-use expense tracking
            tool.
          </Typography>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/signup")}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                bgcolor: "primary.light",
                "&:hover": {
                  bgcolor: "primary.main",
                },
              }}
            >
              Create Account
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                borderColor: "primary.light",
                color: "primary.light",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              Log In
            </Button>
          </Stack>

          <Typography
            variant="body2"
            color="rgba(255, 255, 255, 0.5)"
            sx={{ mt: 2 }}
          >
            Start managing your expenses and achieve your financial goals today!
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
