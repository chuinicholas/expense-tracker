import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          bgcolor: "background.paper",
          boxShadow: 2,
          "&:hover": {
            bgcolor: "background.paper",
            opacity: 0.9,
          },
        }}
      >
        {isDarkMode ? (
          <LightModeIcon sx={{ color: "primary.light" }} />
        ) : (
          <DarkModeIcon sx={{ color: "primary.main" }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
