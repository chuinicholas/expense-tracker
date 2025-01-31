import { Box, Typography, Tooltip, Avatar } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function UserGreeting() {
  const { currentUser } = useAuth();
  const userName = currentUser?.displayName || "Guest";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <Tooltip title={`Hello, ${userName}! 😊`} placement="right">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1.5,
          px: 1.5,
          borderRadius: "50px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          width: "100%",
          overflow: "hidden",
          minWidth: "48px", // Ensure minimum width for the avatar
          justifyContent: "flex-start",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 40,
            height: 40,
            fontSize: "1.2rem",
            fontWeight: 500,
            flexShrink: 0, // Prevent avatar from shrinking
          }}
        >
          {initial}
        </Avatar>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "text.primary",
            fontSize: "0.95rem",
            letterSpacing: "0.01em",
          }}
        >
          Hello, {userName}! 😊
        </Typography>
      </Box>
    </Tooltip>
  );
}
